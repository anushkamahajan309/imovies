const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🎬 Starting IMovies: Server (Port 5000) & Client (Port 5173)');
console.log('====================================================\n');

// 1. Launch Server
const server = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'inherit'
});

// 2. Launch Client
const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  shell: true,
  stdio: 'inherit'
});

server.on('close', code => console.log(`Backend server stopped (${code})`));
client.on('close', code => console.log(`Frontend client stopped (${code})`));
