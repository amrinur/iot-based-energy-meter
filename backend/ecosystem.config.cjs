module.exports = {
  apps: [
    // Backend
    {
      name: 'backend',
      script: './dist/index.js',
      cwd: '/home/ijazahasli/energy-meter/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      time: true
    },
    // Frontend
    {
      name: 'client',
      script: 'npx',
      args: 'serve -s dist -l 5173',
      cwd: '/home/ijazahasli/energy-meter/client',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      time: true
    }
  ]
};