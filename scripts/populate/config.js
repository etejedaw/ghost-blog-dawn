module.exports = {
    GHOST_URL: process.env.GHOST_URL || `http://localhost:${process.env.GHOST_PORT || 2368}`,
    MAILPIT_URL: `http://localhost:${process.env.MAILPIT_UI_PORT || 8025}`,
    OWNER: {
        name: 'Aprendiz Local',
        email: 'owner@local.test',
        password: 'aprendizlocal',
        blogTitle: 'Grimorio Local',
    },
    INTEGRATION_NAME: 'Local Seed',
    STATE_FILE: '.ghost-local.json',
    // Must match the bind-mount folder in docker-compose.yml (themes/<name>)
    THEME_NAME: 'dawn',
    SITE_BRANDING: [
        {key: 'accent_color', value: '#8b5cf6'},
        {key: 'locale', value: 'es'},
        {key: 'description', value: 'Pergaminos y apuntes de un aprendiz'},
    ],
};
