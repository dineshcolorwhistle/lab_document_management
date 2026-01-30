module.exports = {
  apps: [
    {
      name: "lab-doc-api",
      script: "server/src/server.js",
      instances: 1,              // or "max" later
      exec_mode: "fork",         // switch to cluster when ready
      watch: false,              // NEVER true in production
      autorestart: true,
      max_memory_restart: "500M",
      wait_ready: true,
      listen_timeout: 10000,

      env: {
        NODE_ENV: "production",
        PORT: 7001
      }
    }
  ]
};
