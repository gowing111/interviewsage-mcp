import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { interviewCoachSchema } from '../schemas.js';

interface CoachResult {
  score?: number | null;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  sampleAnswer?: string;
}

export function registerInterviewCoach(server: McpServer, client: McpClient): void {
  server.tool(
    'interview_coach',
    '单面陪练点评（会员）。对某道面试题的回答打分，并给出亮点、改进点与参考回答。需会员。',
    interviewCoachSchema,
    async (args) => {
      const payload = args.resumeText
        ? { question: args.question, userAnswer: args.userAnswer, resumeText: args.resumeText }
        : { question: args.question, userAnswer: args.userAnswer };
      const env = await client.post<CoachResult>('/interview-coach', payload);
      const d = env.data ?? ({} as CoachResult);

      const strengths = (d.strengths ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n');
      const improvements = (d.improvements ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n');

      const text = [
        d.score != null ? `评分：${d.score} / 10` : null,
        d.feedback ? `点评：${d.feedback}` : '',
        strengths ? `\n亮点：\n${strengths}` : '',
        improvements ? `\n改进点：\n${improvements}` : '',
        d.sampleAnswer ? `\n参考回答：\n${d.sampleAnswer}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      return { content: [{ type: 'text', text }] };
    },
  );
}
