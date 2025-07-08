// import { defineConfig } from 'vite'
// 'vitest/config'にしないと「test:」の型が使用できない
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // 仮想DOM環境でテスト（ブラウザのような環境）
    globals: true, // describe / it / expect をグローバルに使える
    setupFiles: ["./vitest.setup.ts"], // クリーン用、配列にすること！
  },
});
