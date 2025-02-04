import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

import { encrypt } from './src/crypto.utils.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLCVII_PASSWORD: string;
      CLCVII_SERIAL: string;
    }
  }
}

export default defineConfig(async ({ mode }) => {
  const { CLCVII_PASSWORD, CLCVII_SERIAL } = loadEnv(mode, './', '');
  if (!CLCVII_PASSWORD || !CLCVII_SERIAL) {
    throw new Error('Missing required environment variables');
  }

  const { cipher, iv } = await encrypt(CLCVII_SERIAL, CLCVII_PASSWORD);
  const cipherBlob = new Blob([cipher], { type: 'text/plain; charset=utf-8' });
  const cipherBuffer = await cipherBlob.arrayBuffer();
  const cipherText = Buffer.from(cipherBuffer).toString('base64');

  return {
    base: './',
    root: 'src',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: [fileURLToPath(new URL('src/index.html', import.meta.url))]
      }
    },
    publicDir: '../public',
    define: {
      __CLCVII_SHARED_IV: JSON.stringify(Array.from(iv)),
      __CLCVII_CIPHER_TEXT: JSON.stringify(cipherText)
    }
  } satisfies UserConfig;
});
