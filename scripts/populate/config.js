module.exports = {
    GHOST_URL: process.env.GHOST_URL || 'http://localhost:2368',
    OWNER: {
        name: 'Aprendiz Local',
        email: 'owner@local.test',
        password: 'aprendizlocal',
        blogTitle: 'Grimorio Local',
    },
    INTEGRATION_NAME: 'Local Seed',
    STATE_FILE: '.ghost-local.json',
};
