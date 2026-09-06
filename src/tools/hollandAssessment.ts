import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { hollandSchema } from '../schemas.js';

interface HollandQuestion {
  id: number;
  text: string;
}

interface HollandResult {
  mode: 'questions' | 'report';
  total?: number;
  instructions?: string;
  questions?: HollandQuestion[];
  hollandCode?: string;
  typeName?: string;
  reportData?: Record<string, any>;
}

export function registerHollandAssessment(server: McpServer, client: McpClient): void {
  server.tool(
    'holland_assessment',
    '霍兰德职业兴趣测评（免费，规则计算）。不传 answers 时下发 60 道题；提交 60 题答案后返回三字母职业代码与完整解读报告。',
    hollandSchema,
    async (args) => {
      const payload = args.answers ? { answers: args.answers } : {};
      const env = await client.post<HollandResult>('/holland', payload);
      const d = env.data!;

      if (d.mode === 'questions') {
        const lines = (d.questions ?? []).map((q) => `${q.id}. ${q.text}`);
        return {
          content: [
            {
              type: 'text',
              text: `霍兰德测评共 ${d.total} 题，请逐题按 1~5 打分：\n\n${lines.join('\n')}\n\n${d.instructions ?? ''}`,
            },
          ],
        };
      }

      const cover = d.reportData?.cover ?? {};
      const scores = (cover.scores ?? {}) as Record<string, number>;
      const dimLine = Object.entries(scores)
        .map(([k, v]) => `${k} ${v}`)
        .join(' · ');
      const summary = [
        `霍兰德代码：${d.hollandCode}（${d.typeName}）`,
        cover.oneLiner ? `一句话：${cover.oneLiner}` : null,
        dimLine ? `六维得分（满分 50）：${dimLine}` : null,
        cover.consistencyBadge ? `一致性：${cover.consistencyBadge}` : null,
        cover.differentiationBadge ? `分化度：${cover.differentiationBadge}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `${summary}\n\n完整报告（结构化）：\n${JSON.stringify(d.reportData, null, 2)}`,
          },
        ],
      };
    },
  );
}
