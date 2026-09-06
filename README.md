# 面面星 MCP Server（@interviewsage/mcp）

把面面星（InterviewSage）的求职辅导能力接入你常用的 AI 助手（Claude Desktop / Cursor / 腾讯 WorkBuddy 等），让它直接调用「查干货、做测评、刷笔试真题」等能力。

> ⚠️ **保密说明**：本仓库是一个**极薄的 relay**，只包含工具声明、入参 schema、HTTP 转发与鉴权。简历打分、匹配机制、LLM prompt、自动填写选择器等核心逻辑**全部在服务端**，不在此仓库，也不开源。

---

## 快速开始

### 1. 生成 API Key

1. 打开面面星网页端 <https://www.interviewsage.cn>
2. 登录后进入「会员中心 → API 密钥」
3. 点击「生成」，复制返回的 `mmx_` 开头的密钥（**只显示一次**）

### 2. 配置你的 AI 客户端

#### Claude Desktop / Cursor

编辑配置文件，加入 `interviewsage`：

```jsonc
// claude_desktop_config.json
{
  "mcpServers": {
    "interviewsage": {
      "command": "npx",
      "args": ["-y", "@interviewsage/mcp"],
      "env": {
        "INTERVIEWSAGE_API_KEY": "mmx_你的密钥",
        "INTERVIEWSAGE_BASE_URL": "https://www.interviewsage.cn"
      }
    }
  }
}
```

#### 腾讯 WorkBuddy

编辑 `~/.workbuddy/mcp.json`（Windows：`C:\Users\你的用户名\.workbuddy\mcp.json`）：

```jsonc
{
  "mcpServers": {
    "interviewsage": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@interviewsage/mcp"],
      "env": {
        "INTERVIEWSAGE_API_KEY": "mmx_你的密钥",
        "INTERVIEWSAGE_BASE_URL": "https://www.interviewsage.cn"
      }
    }
  }
}
```

配置后到 WorkBuddy 连接器管理页找到「interviewsage」，点击「信任」后刷新即可。

---

## 工具清单

| 工具名 | 功能 | 档位 | 说明 |
|---|---|---|---|
| `health` | 连通性 + 权益回显 | 免费 | 验证 key 是否有效、当前套餐 |
| `search_articles` | 求职干货检索 | 免费 | 关键词检索 44+ 篇方法论文章，零 AI 成本 |
| `holland_assessment` | 霍兰德职业测评 | 免费 | 60 题兴趣测评，返回三字母代码 + 解读报告 |
| `interview_questions_bank` | 笔试真题库 | 免费 | 分类树 / 抽题（不含答案）/ 判分解析 |
| `resume_diagnose` | 快速简历诊断 | 免费试用 1 次 | 综合评分 + 五维打分 + 亮点/问题/建议 |
| `resume_rewrite` | 简历改写 | 会员 | STAR 重构经历、优化措辞 |
| `resume_tailor` | 岗位定制 | 会员（35 积分） | 按 JD 定制，突出匹配关键词 |
| `interview_coach` | 单面陪练点评 | 会员 | 答题打分 + 改进点 + 参考回答 |
| `interview_prediction` | 面试押题 | 会员 | 按公司/岗位预测面试题 |
| `ocr_exam_search` | OCR 拍照搜题 | Pro | 上传题目图片，识别题干并返回答案与解析（月度额度） |

> 会员级能力（简历改写、岗位定制、单面陪练、面试押题等）通过服务端会员门禁控制；被拒时 AI 会展示开通链接（upgradeUrl）。OCR 拍照搜题为 Pro 专属。

---

## 本地开发

```bash
npm install
npm run build      # 编译 TypeScript 到 dist/
npm run dev        # 直接跑源码（tsx）
```

运行（需先设置环境变量）：

```bash
INTERVIEWSAGE_API_KEY=mmx_xxx npx -y @interviewsage/mcp
```

---

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `INTERVIEWSAGE_API_KEY` | 是 | — | 面面星网页端生成的 API key（`mmx_` 前缀） |
| `INTERVIEWSAGE_BASE_URL` | 否 | `https://www.interviewsage.cn` | 服务端地址，一般无需改 |

---

## FAQ

**Q：为什么我的 key 用不了？**
A：到网页端「API 密钥」页确认 key 未撤销、未过期、未禁用；重新生成一把试试。

**Q：免费和会员有什么区别？**
A：免费含 4 个工具（health / search_articles / holland_assessment / interview_questions_bank）+ resume_diagnose 首次免费试用。会员解锁 resume_rewrite / resume_tailor（35 积分）/ interview_coach / interview_prediction；Pro 额外解锁 ocr_exam_search（月度额度）。被门禁拦截时 AI 会展示开通链接。

**Q：会收费吗？**
A：本 relay 完全免费开源（MIT）。面面星会员是另一回事，一个身份网页端与 MCP 端通用。

**Q：key 会过期吗？**
A：默认长期有效，可在网页端随时撤销。建议定期轮换。

---

## License

MIT。本仓库为薄 relay，不含面面星任何核心业务逻辑。
