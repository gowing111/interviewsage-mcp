import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { resumeRewriteSchema } from '../schemas.js';

interface RewriteResult {
  rewrittenText?: string;
  changes?: Array<{ section: string; summary: string; before: string; after: string }>;
}

export function registerResumeRewrite(server: McpServer, client: McpClient): void {
  server.tool(
    'resume_rewrite',
    '简历改写（会员）。用 STAR 法则重构经历、优化措辞，返回改写后的完整简历与改动说明。需会员。',
    resumeRewriteSchema,
    async (args) => {
      const env = await client.post<RewriteResult>('/resume-rewrite', { resumeText: args.resumeText });
      const d = env.data ?? ({} as RewriteResult);

      const changes = (d.changes ?? [])
        .map((c, i) => `${i + 1}. [${c.section}] ${c.summary}\n   原文：${c.before}\n   改后：${c.after}`)
        .join('\n');

      const text = changes
        ? `改动说明：\n${changes}\n\n── 改写后全文 ──\n\n${d.rewrittenText ?? ''}`
        : (d.rewrittenText ?? '');

      return { content: [{ type: 'text', text }] };
    },
  );
}
