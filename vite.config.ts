import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

function apiDevPlugin(): Plugin {
  return {
    name: 'internal-api-dev',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) return next();
        try {
          const mod = await server.ssrLoadModule('/src/server/entry.ts');
          return mod.default(req, res, next);
        } catch (error) {
          if (error instanceof Error) server.ssrFixStacktrace(error);
          return next(error);
        }
      });
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  envPrefix: ['VITE_'],
  plugins: [react(), apiDevPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      '@/api': path.resolve(__dirname, './src/server/api'),
      '@server': path.resolve(__dirname, './src/server'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { host: process.env.HOST || '127.0.0.1', port: Number(process.env.PORT || 5173) },
  preview: { host: process.env.HOST || '127.0.0.1', port: Number(process.env.PORT || 4173) },
  build: isSsrBuild
    ? { outDir: 'dist/server', emptyOutDir: false, copyPublicDir: false, ssr: 'src/server/entry.ts' }
    : { outDir: 'dist/client', emptyOutDir: true, copyPublicDir: true },
}));
