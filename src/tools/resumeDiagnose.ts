import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { resumeDiagnoseSchema } from '../schemas.js';

interface DiagnoseResult {
  overallScore?: number | null;
  summary?: string;
  dimensions?: Array<{ key: string; name: string; score: number; comment: string }>;
  strengths?: string[];
  issues?: string[];
  suggestions?: string[];
}

export function registerResumeDiagnose(server: McpServer, client: McpClient): void {
  server.tool(
    'resume_diagnose',
    '快速简历诊断（免费试用 1 次）。输入简历全文，返回综合评分、五维打分、亮点、问题与可执行改进建议。首次免费，再次使用需开通会员。',
    resumeDiagnoseSchema,
    async (args) => {
      const env = await client.post<DiagnoseResult>('/resume-diagnose', { resumeText: args.resumeText });
      const d = env.data ?? ({} as DiagnoseResult);

      const dims = (d.dimensions ?? [])
        .map((x) => `  · ${x.name}：${x.score} 分 — ${x.comment}`)
        .join('\n');
      const strengths = (d.strengths ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n');
      const issues = (d.issues ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n');
      const suggestions = (d.suggestions ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n');

      const text = [
        `综合评分：${d.overallScore ?? '—'} / 100`,
        d.summary ? `\n总评：${d.summary}` : '',
        dims ? `\n五维评分：\n${dims}` : '',
        strengths ? `\n亮点：\n${strengths}` : '',
        issues ? `\n问题：\n${issues}` : '',
        suggestions ? `\n改进建议：\n${suggestions}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      return { content: [{ type: 'text', text }] };
    },
  );
}
