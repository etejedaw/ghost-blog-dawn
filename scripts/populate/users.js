const GhostAdminAPI = require('@tryghost/admin-api');
const {GHOST_URL} = require('./config');
const state = require('./state');

const api = new GhostAdminAPI({
    url: GHOST_URL,
    key: state.getApiKey(),
    version: 'v5.0',
});

const members = [
    {email: 'aprendiz1@local.test', name: 'Aprendiz Uno', note: 'Miembro libre recién llegado'},
    {email: 'aprendiz2@local.test', name: 'Aprendiz Dos', note: 'Miembro libre con nombre largo para probar truncado'},
    {email: 'sin-nombre@local.test'},
    {email: 'invitada@local.test', name: 'Invitada del Pergamino', note: 'Para pruebas de greeting/farewell'},
];

async function main() {
    for (const m of members) {
        try {
            await api.members.add(m);
            console.log(`✓ Member: ${m.email}`);
        } catch (err) {
            const msg = err.context || err.message || '';
            if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('member already exists')) {
                console.log(`- Member already exists: ${m.email}`);
            } else {
                console.error(`✗ Member ${m.email}: ${msg}`);
            }
        }
    }
}

main().catch(err => {
    console.error('✗ Users seed failed:', err.message);
    process.exit(1);
});
