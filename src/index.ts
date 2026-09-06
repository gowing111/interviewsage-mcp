#!/usr/bin/env node
/**
 * 面面星（InterviewSage）MCP server 入口。
 * 薄 relay：只负责注册工具 + 启动 stdio transport + 转发 HTTP。
 * 核心业务逻辑全部在服务端，本仓库不含任何计分/匹配/prompt。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpClient } from './client.js';
import { registerHealth } from './tools/health.js';
import { registerSearchArticles } from './tools/searchArticles.js';
import { registerHollandAssessment } from './tools/hollandAssessment.js';
import { registerInterviewQuestions } from './tools/interviewQuestions.js';
import { registerResumeDiagnose } from './tools/resumeDiagnose.js';
import { registerResumeRewrite } from './tools/resumeRewrite.js';
import { registerResumeTailor } from './tools/resumeTailor.js';
import { registerInterviewCoach } from './tools/interviewCoach.js';
import { registerInterviewPrediction } from './tools/interviewPrediction.js';
import { registerOcrExamSearch } from './tools/ocrExamSearch.js';

const NAME = 'interviewsage';
const VERSION = '0.1.0';

async function main(): Promise<void> {
  const server = new McpServer({ name: NAME, version: VERSION });
  const client = new McpClient();

  registerHealth(server, client);
  registerSearchArticles(server, client);
  registerHollandAssessment(server, client);
  registerInterviewQuestions(server, client);
  registerResumeDiagnose(server, client);
  registerResumeRewrite(server, client);
  registerResumeTailor(server, client);
  registerInterviewCoach(server, client);
  registerInterviewPrediction(server, client);
  registerOcrExamSearch(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stdio 铁律：stdout 仅供 JSON-RPC 协议使用，所有日志走 stderr。
  console.error(`[interviewsage-mcp] ${NAME} v${VERSION} 已启动`);
}

main().catch((err) => {
  console.error('[interviewsage-mcp] 启动失败:', err);
  process.exit(1);
});
