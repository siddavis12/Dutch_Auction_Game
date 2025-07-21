import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPort(port) {
  try {
    // Windows에서 포트를 사용하는 프로세스 찾기
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    }
    
    // 찾은 프로세스 종료
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`Killed process ${pid} using port ${port}`);
      } catch (error) {
        console.log(`Could not kill process ${pid}:`, error.message);
      }
    }
    
    if (pids.size === 0) {
      console.log(`No process found using port ${port}`);
    }
  } catch (error) {
    console.log(`Port ${port} is free`);
  }
}

// 명령줄 인자로 포트 받기
const port = process.argv[2] || process.env.PORT || 3001;
killPort(port);