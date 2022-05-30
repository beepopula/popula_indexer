module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'popula_indexer',
      script    : 'index.js',
      instances : "1",
      exec_mode : "fork",
      autorestart: true,
      "cron_restart":"20 0 * * *",
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_devtestnet : {
        NODE_ENV: 'devtestnet'
      },
      env_testnet : {
        NODE_ENV: 'testnet'
      },
      env_mainnet : {
        NODE_ENV: 'mainnet'
      }
    }
  ]
};
