import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3500',
        ws: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // 파일명에 해시 추가로 캐시 무효화
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 큰 라이브러리들을 별도 청크로 분리
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion'],
          'styled-vendor': ['styled-components'],
          'socket-vendor': ['socket.io-client']
        }
      }
    },
    // 청크 크기 경고 임계값 조정 (선택사항)
    chunkSizeWarningLimit: 600
  }
})