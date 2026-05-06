const fs = require('node:fs');
const path = require('node:path');
const { STATE_FILE } = require('./config');

const filePath = path.resolve(__dirname, '..', '..', STATE_FILE);

function read() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function write(state) {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n');
}

function getApiKey() {
    const key = read().adminApiKey;
    if (!key) {
        throw new Error(
            `No admin API key found in ${STATE_FILE}. Run "npm run populate:admin" first.`
        );
    }
    return key;
}

function setApiKey(adminApiKey) {
    write({...read(), adminApiKey});
}

function clear() {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

module.exports = {getApiKey, setApiKey, clear};
