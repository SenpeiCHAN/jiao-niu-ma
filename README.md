# 脚牛马项目

uni-app + Vue 3 + TypeScript 项目。当前以 H5 为首发目标，并保持与微信小程序共享同一套源码。

## 本地预览

```powershell
npm.cmd run dev:h5
```

按终端输出的 `http://localhost:xxxx/` 地址访问；不要直接双击 `dist/build/h5/index.html`，`file:///` 无法正确加载 H5 模块与站点根路径资源。

## GitHub Pages 发布

项目已包含 GitHub Actions 工作流：推送至 `main` 后，它会安装锁定依赖、构建 H5，并把 `dist/build/h5` 部署到 GitHub Pages。

首次推送后，在仓库 **Settings → Pages → Build and deployment** 中确认 Source 为 **GitHub Actions**。站点地址通常为：

```text
https://<GitHub 用户名>.github.io/<仓库名>/
```

工作流会依据实际仓库名设置资源基路径，不要求仓库固定命名为 `jiao-niu-ma`。
