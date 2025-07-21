import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  const port = process.env.PORT || 3001;
  
  console.log(`Killing any process on port ${port}...`);
  
  // PowerShell 스크립트로 강제 종료
  const killProcess = spawn('powershell.exe', [
    '-ExecutionPolicy', 'Bypass',
    '-File', join(__dirname, 'force-kill-port.ps1'),
    '-port', port
  ], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  await new Promise((resolve) => {
    killProcess.on('close', resolve);
  });
  
  // 포트가 완전히 해제될 때까지 대기
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`Starting server on port ${port}...`);
  
  // 서버 시작
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
  
  process.on('SIGINT', () => {
    serverProcess.kill('SIGINT');
    process.exit();
  });
}

startServer();