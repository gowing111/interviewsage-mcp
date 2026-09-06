# 面面星 MCP Server

### InterviewSage MCP — AI 求职辅导工具，直连你常用的 AI 助手

[![npm version](https://img.shields.io/npm/v/@interviewsage/mcp)](https://www.npmjs.com/package/@interviewsage/mcp)
[![license](https://img.shields.io/npm/l/@interviewsage/mcp)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-server-blue)](https://modelcontextprotocol.io)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)

**InterviewSage MCP**（`@interviewsage/mcp`）是一个 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server，把面面星（InterviewSage）的 **简历诊断、简历改写、岗位定制、面试押题、笔试真题、霍兰德职业测评** 等求职辅导能力，接入你日常使用的 AI 助手——**Claude Desktop、Cursor、腾讯 WorkBuddy** 等。从此你可以直接用自然语言让 AI 帮你写简历、刷笔试、练面试。

> 面向人群：求职中的**应届生、社招转行者、想系统准备笔试面试的求职者**，以及希望把求职能力嵌入自己 AI 工作流的人。

---

## 目录

- [这是什么？](#这是什么)
- [为什么选面面星？](#为什么选面面星)
- [能力一览](#能力一览)
- [快速开始](#快速开始)
- [使用场景 & 对话示例](#使用场景--对话示例)
- [工具详解](#工具详解)
- [支持的 AI 客户端](#支持的-ai-客户端)
- [环境变量](#环境变量)
- [常见问题 FAQ](#常见问题-faq)
- [本地开发](#本地开发)
- [保密声明](#保密声明)
- [License](#license)

---

## 这是什么？

面面星 MCP 是一座「桥」：一端是你熟悉的 AI 助手，另一端是面面星的服务端求职智能。你在 AI 里用中文说一句需求（比如「帮我诊断这份简历」），AI 就会调用对应的工具，把结果组织成可读的答案返回给你。

一句话理解：**AI 负责对话和理解，面面星负责专业的求职能力**（简历打分、简历改写、面试出题、笔试判分、职业测评）。

> ⚠️ **保密说明**：本仓库是一个**极薄的 relay**，只包含工具声明、入参 schema、HTTP 转发与鉴权。简历打分、匹配机制、LLM prompt、自动填写选择器等核心逻辑**全部在服务端**，不在此仓库，也不开源。详见[保密声明](#保密声明)。

---

## 为什么选面面星？

| 优势 | 说明 |
|---|---|
| **免费层真实可用** | 4 个免费工具（干货检索 / 霍兰德测评 / 笔试真题 / 权益查询）+ 1 次简历诊断免费试用，零门槛先体验 |
| **服务端智能** | 核心算法与模型在服务端统一维护，所有用户用到的是同一套最新能力；relay 零业务逻辑、开源可审计 |
| **一键接入** | `npx` 一条命令即用，无需本地部署模型、无需复杂配置 |
| **懂国内求职** | 中文简历、中文面试、行测/大厂笔试真题、霍兰德职业测评，贴合国内求职真实场景 |

---

## 能力一览

面面星 MCP 提供 **10 个工具**，按档位分级：

| 档位 | 工具 | 一句话能力 |
|---|---|---|
| 免费 | `health` / `search_articles` / `holland_assessment` / `interview_questions_bank` | 查权益、搜干货、做测评、刷真题 |
| 试用 | `resume_diagnose` | 简历综合诊断（首次免费） |
| 会员 | `resume_rewrite` / `resume_tailor` / `interview_coach` / `interview_prediction` | 改写简历、定制岗位、单面陪练、面试押题 |
| Pro | `ocr_exam_search` | 拍照搜题（月度额度） |

完整能力与入参见[工具详解](#工具详解)。

---

## 快速开始

### 1. 生成 API Key

1. 打开面面星网页端 <https://www.interviewsage.cn>
2. 登录后进入「会员中心 → API 密钥」
3. 点击「生成」，复制返回的 `mmx_` 开头的密钥（**只显示一次**，请妥善保存）

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

#### 其他 MCP 客户端

任何支持 MCP（stdio transport）的客户端都可接入，配置方式同上（`command: npx` + `args: -y @interviewsage/mcp` + 环境变量）。

---

## 使用场景 & 对话示例

以下示例展示了你在 AI 助手里的典型用法。AI 会识别你的意图并自动调用对应工具。

### 场景 1：简历诊断（免费试用）

> **你**：这是我应届生的简历，帮我诊断一下有哪些问题、怎么改
> （附上简历全文）
>
> **AI**（调用 `resume_diagnose`）：综合评分 68/100，五个维度分别是……主要问题有 3 点……建议……

### 场景 2：简历改写（会员）

> **你**：把我的实习经历用 STAR 法则改写，突出量化成果
>
> **AI**（调用 `resume_rewrite`）：改后把「负责 XX」改成了「通过 XX 动作，实现 XX 结果，提升 XX%」……

### 场景 3：岗位定制（会员）

> **你**：我投腾讯的产品经理岗，按这个 JD 定制我的简历
> （附上 JD 全文）
>
> **AI**（调用 `resume_tailor`）：命中关键词「用户增长、数据分析、跨团队协作」……定制后简历突出这些匹配点……

### 场景 4：面试押题（会员）

> **你**：我要面字节跳动的后端开发岗，帮我预测会被问什么题
>
> **AI**（调用 `interview_prediction`）：预测 8 道题，附参考答案、答题思路与可能追问……

### 场景 5：笔试刷题（免费）

> **你**：帮我抽几道行测「数量关系」的题练练
>
> **AI**（调用 `interview_questions_bank`）：抽出 10 题（不含答案）……你作答后它判分并给出解析。

### 场景 6：职业测评（免费）

> **你**：帮我测测我适合什么职业方向
>
> **AI**（调用 `holland_assessment`）：先下发 60 道兴趣题……作答后返回三字母职业代码与完整解读报告。

---

## 工具详解

| 工具名 | 功能 | 档位 | 解决什么痛点 |
|---|---|---|---|
| `health` | 连通性 + 权益回显 | 免费 | 验证 key 是否有效、当前套餐档位 |
| `search_articles` | 求职干货检索 | 免费 | 关键词检索简历/面试/笔试/职业规划方法论文章，零 AI 成本 |
| `holland_assessment` | 霍兰德职业测评 | 免费 | 60 题兴趣测评，返回三字母代码 + 解读报告，帮选职业方向 |
| `interview_questions_bank` | 笔试真题库 | 免费 | 分类树 / 抽题（不含答案）/ 判分解析，覆盖行测与名企真题 |
| `resume_diagnose` | 快速简历诊断 | 免费试用 1 次 | 综合评分 + 五维打分 + 亮点/问题/建议，找简历硬伤 |
| `resume_rewrite` | 简历改写 | 会员 | STAR 重构经历、优化措辞，把流水账改成结果链 |
| `resume_tailor` | 岗位定制 | 会员（35 积分） | 按目标 JD 定制简历，突出匹配关键词与经历 |
| `interview_coach` | 单面陪练点评 | 会员 | 对某道面试题的回答打分，给亮点/改进点/参考回答 |
| `interview_prediction` | 面试押题 | 会员 | 按公司/岗位预测面试题，附参考答案与思路 |
| `ocr_exam_search` | OCR 拍照搜题 | Pro（月度额度） | 上传题目图片，识别题干并返回答案与解析 |

> 会员级能力（简历改写、岗位定制、单面陪练、面试押题等）通过服务端会员门禁控制；被拒时 AI 会展示开通链接（upgradeUrl）。OCR 拍照搜题为 Pro 专属。

---

## 支持的 AI 客户端

| 客户端 | 接入方式 | 说明 |
|---|---|---|
| Claude Desktop | `npx -y @interviewsage/mcp` | 官方 MCP 支持 |
| Cursor | 同上 | 官方 MCP 支持 |
| 腾讯 WorkBuddy | stdio（`~/.workbuddy/mcp.json`） | 国内 PC 端 AI 办公智能体 |
| 其他 MCP 客户端 | stdio transport | 任何实现 MCP 协议的客户端均可 |

> 远程（Streamable HTTP）接入方式已规划，届时无需本地 `npx` 即可直连，敬请期待。

---

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `INTERVIEWSAGE_API_KEY` | 是 | — | 面面星网页端生成的 API key（`mmx_` 前缀） |
| `INTERVIEWSAGE_BASE_URL` | 否 | `https://www.interviewsage.cn` | 服务端地址，一般无需改 |

---

## 常见问题 FAQ

**Q：免费和会员有什么区别？**
A：免费含 4 个工具（health / search_articles / holland_assessment / interview_questions_bank）+ resume_diagnose 首次免费试用。会员解锁 resume_rewrite / resume_tailor（35 积分）/ interview_coach / interview_prediction；Pro 额外解锁 ocr_exam_search（月度额度）。被门禁拦截时 AI 会展示开通链接。

**Q：我的简历数据会去哪？**
A：你在 AI 里输入的简历文本会通过 HTTPS 传到面面星服务端处理，用于生成诊断/改写结果。relay 本身**不存储、不解析**你的数据——它只是一条加密通道。数据安全由面面星服务端保障。

**Q：API key 安全吗？**
A：面面星服务端只存 key 的 SHA-256 哈希，不存明文；明文仅在创建时显示一次。若泄露，可在网页端「API 密钥」页随时撤销并重新生成。

**Q：为什么核心逻辑在服务端，而不是开源？**
A：简历打分、匹配机制、LLM prompt 等是面面星的核心商业能力，需统一维护以保证所有用户用同一套最新模型。开源的是 relay 层（工具声明 + 转发），你完全可以审计它不会偷看或篡改你的数据。

**Q：key 会过期吗？**
A：默认长期有效，可在网页端随时撤销。建议定期轮换以降低泄露风险。

**Q：会收费吗？**
A：本 relay 完全免费开源（MIT）。面面星会员是另一回事，一个身份在网页端与 MCP 端通用。

**Q：我的 key 用不了怎么办？**
A：到网页端「API 密钥」页确认 key 未撤销、未过期、未禁用；重新生成一把试试。

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

## 保密声明

本仓库是面面星 MCP 的**薄 relay 客户端**，仅包含：

- 工具声明与入参 schema（zod）
- HTTP 转发（拼 URL + 加鉴权头 + 错误透传）
- 展示层格式化（把服务端返回的结构化数据渲染成文本）

**不包含**任何核心业务逻辑：简历打分、匹配机制、LLM prompt、自动填写选择器等均在面面星服务端，不在此仓库、不开源。

---

## License

[MIT](LICENSE)。本仓库为薄 relay，不含面面星任何核心业务逻辑。
