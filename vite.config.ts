import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 的项目站点位于 /<仓库名>/ 下；本地开发仍使用根路径。
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [uni()],
});
