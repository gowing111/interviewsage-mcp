import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { resumeTailorSchema } from '../schemas.js';

interface TailorResult {
  tailoredText?: string;
  matchedKeywords?: string[];
  changes?: Array<{ section: string; summary: string; before: string; after: string }>;
  pointsCost?: number;
  balance?: number;
}

export function registerResumeTailor(server: McpServer, client: McpClient): void {
  server.tool(
    'resume_tailor',
    '岗位定制（会员，消耗 35 积分）。根据目标岗位 JD 定制简历，突出与之匹配的关键词与经历。需会员。',
    resumeTailorSchema,
    async (args) => {
      const env = await client.post<TailorResult>('/resume-tailor', {
        resumeText: args.resumeText,
        jdText: args.jdText,
      });
      const d = env.data ?? ({} as TailorResult);

      const keywords = (d.matchedKeywords ?? []).join('、');
      const changes = (d.changes ?? [])
        .map((c, i) => `${i + 1}. [${c.section}] ${c.summary}\n   原文：${c.before}\n   改后：${c.after}`)
        .join('\n');

      const header = [
        keywords ? `命中关键词：${keywords}` : null,
        d.pointsCost != null ? `本次消耗 ${d.pointsCost} 积分${d.balance != null ? `，剩余 ${d.balance}` : ''}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const text = [
        header,
        changes ? `改动说明：\n${changes}` : '',
        `── 定制后全文 ──\n\n${d.tailoredText ?? ''}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      return { content: [{ type: 'text', text }] };
    },
  );
}
