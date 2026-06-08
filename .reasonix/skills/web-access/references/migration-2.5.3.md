# v2.5.3 迁移指南：`/new` 和 `/navigate` 改 POST body

## TL;DR

```diff
- curl -s "http://localhost:3456/new?url=https://example.com"
+ curl -s -X POST --data-raw 'https://example.com' http://localhost:3456/new

- curl -s "http://localhost:3456/navigate?target=ID&url=https://example.com"
+ curl -s -X POST --data-raw 'https://example.com' "http://localhost:3456/navigate?target=ID"
```

旧写法收到 `400` + 包含本文档路径的错误信息后，按下方对照表改写调用。

## 为什么改

旧版 `/new?url=...` 把目标 URL 塞进 query 参数。当目标 URL 自带 query（如小红书笔记必须携带 `xsec_token`），proxy 用 `URL.searchParams` 解析时，目标 URL 里未编码的 `&` 会被当成 **proxy 自身的** query 分隔符，导致目标 URL 被错误切分、token 等关键参数丢失。

v2.5.3 把 URL 改为通过 **POST body** 传入。HTTP body 是不透明字节流，不存在任何分隔符歧义。

## 转换对照表

### `/new`

| 场景 | 旧（v2.5.2） | 新（v2.5.3） |
|---|---|---|
| 简单 URL | `curl ".../new?url=https://example.com"` | `curl -X POST --data-raw 'https://example.com' .../new` |
| URL 含 query | `curl ".../new?url=https://xhs.com/explore/x?xsec_token=ABC"` | `curl -X POST --data-raw 'https://xhs.com/explore/x?xsec_token=ABC' .../new` |
| URL 含 `#` | `curl ".../new?url=https://app/page#sec"` | `curl -X POST --data-raw 'https://app/page#sec' .../new` |

### `/navigate`

| 旧 | 新 |
|---|---|
| `curl ".../navigate?target=ID&url=URL"` | `curl -X POST --data-raw 'URL' ".../navigate?target=ID"` |

## Agent 自检 checklist

1. **判断调用是否过时**：搜索 `localhost:3456/new?url=` 或 `localhost:3456/navigate?` 后跟 `&url=`
2. **就地改写**：按上表修改成 POST 形式
3. **更新源文件**：如果旧写法来自 `references/site-patterns/*.md` 中某个站点经验文件，把源文件也一并修正
4. **保留 URL 原样**：POST body 中 `?`、`&`、`=`、`#` 等字符无需任何转义
