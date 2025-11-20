// Test script to see if Vite can start
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const server = await createServer({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
});

console.log('Starting Vite server...');
await server.listen();
console.log('Vite server started on http://127.0.0.1:5173');

