import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { interviewQuestionsSchema } from '../schemas.js';

interface InterviewQuestionsResult {
  sections?: Array<{ label: string; total: number; subsections: Array<{ label: string; count: number }> }>;
  totalQuestions?: number;
  list?: Array<{
    id: number;
    stem: string;
    options: Array<{ key: string; text: string }>;
  }>;
  pagination?: { total: number };
  isCorrect?: boolean;
  correctAnswer?: string;
  explanation?: string;
  knowledgePoint?: string | null;
}

export function registerInterviewQuestions(server: McpServer, client: McpClient): void {
  server.tool(
    'interview_questions_bank',
    '笔试真题库（免费）。action=sections 查看分类树；action=questions 按大类/企业抽题（不含答案）；action=check 提交答案并返回正误、正确答案与解析。',
    interviewQuestionsSchema,
    async (args) => {
      const env = await client.post<InterviewQuestionsResult>('/interview-questions', args);
      const d = env.data ?? ({} as InterviewQuestionsResult);

      if (args.action === 'sections') {
        const text = (d.sections ?? [])
          .map((s) => {
            const subs = (s.subsections ?? [])
              .map((sub) => `    - ${sub.label}（${sub.count} 题）`)
              .join('\n');
            return `${s.label}（共 ${s.total} 题）\n${subs}`;
          })
          .join('\n');
        return {
          content: [
            { type: 'text', text: `笔试真题库分类（总题量 ${d.totalQuestions ?? 0}）：\n\n${text}` },
          ],
        };
      }

      if (args.action === 'questions') {
        const list = d.list ?? [];
        const text = list
          .map((q, i) => {
            const opts = (q.options ?? []).map((o) => `${o.key}. ${o.text}`).join('\n   ');
            return `${i + 1}. ${q.stem}\n   ${opts}`;
          })
          .join('\n\n');
        const total = d.pagination?.total ?? list.length;
        return {
          content: [
            {
              type: 'text',
              text: `抽到 ${list.length} 题（该筛选下共 ${total} 题）。作答后调用 check 判分：\n\n${text}`,
            },
          ],
        };
      }

      // check
      const verdict = d.isCorrect ? '回答正确' : '回答错误';
      return {
        content: [
          {
            type: 'text',
            text: `${verdict}\n正确答案：${d.correctAnswer ?? ''}\n解析：${d.explanation || '无'}\n知识点：${d.knowledgePoint || '无'}`,
          },
        ],
      };
    },
  );
}
