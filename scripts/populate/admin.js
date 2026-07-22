const GhostAdminAPI = require('@tryghost/admin-api');
const {GHOST_URL, OWNER, INTEGRATION_NAME, STATE_FILE} = require('./config');
const state = require('./state');

let cookies = '';

async function call(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        Origin: GHOST_URL,
        ...(options.headers || {}),
    };
    if (cookies) headers.Cookie = cookies;

    const res = await fetch(`${GHOST_URL}${path}`, {...options, headers});

    const setCookie = res.headers.getSetCookie?.() ?? [];
    if (setCookie.length) {
        cookies = setCookie.map(c => c.split(';')[0]).join('; ');
    }

    return res;
}

async function waitForGhost() {
    process.stdout.write(`Waiting for Ghost at ${GHOST_URL} `);
    for (let i = 0; i < 90; i++) {
        try {
            const res = await fetch(`${GHOST_URL}/ghost/api/admin/site/`);
            if (res.ok) {
                process.stdout.write(' ready\n');
                return;
            }
        } catch {
        }
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error('Ghost did not become reachable in 90s');
}

async function tryExistingKey() {
    let key;
    try {
        key = state.getApiKey();
    } catch {
        return false;
    }
    try {
        const api = new GhostAdminAPI({url: GHOST_URL, key, version: 'v5.0'});
        await api.users.browse({limit: 1});
        console.log(`✓ Existing admin key in ${STATE_FILE} is valid — skipping bootstrap`);
        return true;
    } catch (err) {
        console.log(`- Stored key is invalid (${err.message}); discarding ${STATE_FILE}`);
        state.clear();
        return false;
    }
}

async function runSetup() {
    const setupRes = await call('/ghost/api/admin/authentication/setup/', {
        method: 'POST',
        body: JSON.stringify({
            setup: [{
                name: OWNER.name,
                email: OWNER.email,
                password: OWNER.password,
                blogTitle: OWNER.blogTitle,
            }],
        }),
    });

    if (setupRes.ok) {
        console.log(`✓ Owner created (${OWNER.email})`);
        return;
    }

    const body = await setupRes.text();

    if (setupRes.status === 403 && body.includes('Setup has already been completed')) {
        console.log('- Setup already completed — reusing existing owner');
        return;
    }

    throw new Error(
        `Setup failed (${setupRes.status}): ${body}\n\n` +
        `If the owner credentials changed from a previous run, reset state with:\n` +
        `  docker compose down -v && docker compose up -d`
    );
}

const MAILPIT_URL = 'http://localhost:8025';

async function clearMailpit() {
    try {
        await fetch(`${MAILPIT_URL}/api/v1/messages`, {method: 'DELETE'});
    } catch {
    }
}

async function fetchVerificationCode(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const listRes = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=5`);
            if (listRes.ok) {
                const list = await listRes.json();
                const messages = list.messages || [];
                for (const m of messages) {
                    const detailRes = await fetch(`${MAILPIT_URL}/api/v1/message/${m.ID}`);
                    if (!detailRes.ok) continue;
                    const detail = await detailRes.json();
                    const text = (detail.Text || '') + ' ' + (detail.HTML || '');
                    const match = text.match(/\b(\d{6})\b/);
                    if (match) return match[1];
                }
            }
        } catch {
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error('Verification code email not received from Mailpit within 30s');
}

async function login() {
    await clearMailpit();

    const res = await call('/ghost/api/admin/session/', {
        method: 'POST',
        body: JSON.stringify({username: OWNER.email, password: OWNER.password}),
    });

    if (res.ok) {
        console.log(`✓ Logged in (no 2FA required)`);
        return;
    }

    const body = await res.text();

    if (res.status === 403 && body.includes('2FA')) {
        console.log(`  2FA required — fetching code from Mailpit...`);
        const code = await fetchVerificationCode();
        console.log(`  Got code ${code}, verifying...`);

        // PUT validates the token; POST would just re-send the code email
        const verifyRes = await call('/ghost/api/admin/session/verify/', {
            method: 'PUT',
            body: JSON.stringify({token: code}),
        });

        if (!verifyRes.ok) {
            throw new Error(`2FA verify failed (${verifyRes.status}): ${await verifyRes.text()}`);
        }
        console.log(`✓ 2FA verified, session cookie captured`);
        return;
    }

    throw new Error(`Login failed (${res.status}): ${body}`);
}

function formatKey(adminKey) {
    return adminKey.secret.includes(':')
        ? adminKey.secret
        : `${adminKey.id}:${adminKey.secret}`;
}

async function createIntegration() {
    const listRes = await call('/ghost/api/admin/integrations/?include=api_keys');
    if (listRes.ok) {
        const data = await listRes.json();
        const existing = data.integrations?.find(i => i.name === INTEGRATION_NAME);
        if (existing) {
            const adminKey = existing.api_keys?.find(k => k.type === 'admin');
            if (adminKey) {
                console.log(`✓ Reusing integration "${INTEGRATION_NAME}"`);
                return formatKey(adminKey);
            }
        }
    }

    const createRes = await call('/ghost/api/admin/integrations/?include=api_keys', {
        method: 'POST',
        body: JSON.stringify({
            integrations: [{
                name: INTEGRATION_NAME,
                description: 'Used by populate scripts',
            }],
        }),
    });

    if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(`Integration create failed: ${createRes.status} ${text}`);
    }

    const data = await createRes.json();
    const integration = data.integrations[0];
    const adminKey = integration.api_keys.find(k => k.type === 'admin');
    console.log(`✓ Created integration "${INTEGRATION_NAME}"`);
    return formatKey(adminKey);
}

async function activateTheme(key) {
    const api = new GhostAdminAPI({url: GHOST_URL, key, version: 'v5.0'});
    try {
        await api.themes.activate('dawn');
        console.log(`✓ Theme "dawn" activated`);
    } catch (err) {
        console.error(`- Theme activation failed: ${err.message}`);
    }
}

async function main() {
    await waitForGhost();
    let key;
    if (await tryExistingKey()) {
        key = state.getApiKey();
    } else {
        await runSetup();
        await login();
        key = await createIntegration();
        state.setApiKey(key);
        console.log(`✓ Admin API key saved to ${STATE_FILE}`);
    }
    await activateTheme(key);
}

main().catch(err => {
    console.error('\n✗ Bootstrap failed:', err.message);
    process.exit(1);
});
