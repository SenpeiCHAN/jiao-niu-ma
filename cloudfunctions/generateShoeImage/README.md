# generateShoeImage 云函数

该函数接收原鞋 HTTPS 图片地址和四类风格键，在服务端拼装受控提示词并调用 OpenAI Images Edit。前端不会接触 OpenAI API Key，也不能覆盖“主要造型必须保留”的硬约束。

## 环境变量

- `OPENAI_API_KEY`：必填，只能配置在 CloudBase 云函数环境变量中。
- `AI_GENERATION_ENABLED`：设为 `true` 后才允许实际生图；默认关闭可避免误调用产生费用。
- `OPENAI_IMAGE_MODEL`：可选，默认 `gpt-image-2.5-sunburst`。

## 输入

```json
{
  "styleKey": "involution",
  "sourceImageUrl": "https://...",
  "colorDirection": "雾蓝与银灰",
  "detailDirection": "加强连续线性骨架"
}
```

`sourceImageUrl` 必须是 OpenAI 服务可访问的 HTTPS 地址，建议使用 CloudBase 云存储的短期签名 URL。

## 上线前必须完成

1. 在 CloudBase 开启匿名登录，H5 通过 `@cloudbase/js-sdk` 建立匿名会话。
2. 给匿名角色只开放目标云函数所需的 `FunctionsHttpApiAllow` 权限，不开放数据库管理权限。
3. 增加按用户、IP 和时间窗口的服务端限流与每日额度；当前函数只提供接口骨架，不应在没有额度控制时公开启用。
4. 将返回的 Base64 图片写入 CloudBase 云存储并返回短期 URL。当前 MVP 直接返回压缩 WebP Base64，便于首次联调，但不适合长期生产流量。
