import cluster from 'cluster';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 워커 수를 제한 (최대 4개)
const numWorkers = Math.min(os.cpus().length, 4);

if (cluster.isPrimary) {
  console.log(`🚀 Primary ${process.pid} is starting...`);
  console.log(`📊 Creating ${numWorkers} workers (CPU cores: ${os.cpus().length})`);
  
  // 워커 생성
  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();
    console.log(`✅ Worker ${i + 1} created (PID: ${worker.process.pid})`);
  }
  
  // 워커가 죽으면 재시작
  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} died (${signal || code})`);
    console.log('♻️  Restarting worker...');
    cluster.fork();
  });

  // 클러스터 상태 모니터링
  setInterval(() => {
    const workers = Object.values(cluster.workers);
    console.log(`📈 Active workers: ${workers.length}`);
  }, 30000); // 30초마다 상태 확인

} else {
  // 워커 프로세스
  import('./server.js');
  console.log(`👷 Worker ${process.pid} started`);
}