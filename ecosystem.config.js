export default {
  apps: [
    {
      name: 'lab-doc-api',
      script: 'server/src/server.js',
      cwd: '/home/eduwhistle-lab-document/htdocs/lab-document.eduwhistle.com/lab_document_management',
      env: {
        NODE_ENV: 'production',
        PORT: 7001,
      },
    },
  ],
}
