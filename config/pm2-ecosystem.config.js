module.exports = {
    apps: [{
        name: 'word-count-api',
        script: 'app.js',
        instances: 1,
        exec_mode: "cluster",
        instance_var: "WORD-COUNT-API",
        autorestart: false,
        error_file: '/Work/log/word-count-api.log',
        out_file: '/Work/log/word-count-api.log',
        combine_logs: true,
        env: {
            NODE_ENV: 'config'
        }
    }]
};