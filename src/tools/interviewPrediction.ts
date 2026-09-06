import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { interviewPredictionSchema } from '../schemas.js';

interface PredictedQuestion {
  questionId?: number | string;
  question?: string;
  referenceAnswer?: string;
  referenceDirection?: string;
  logicAndTips?: string;
  category?: string;
  followUps?: string[];
}

interface PredictionResult {
  company?: string;
  jobTitle?: string;
  questions?: PredictedQuestion[];
}

export function registerInterviewPrediction(server: McpServer, client: McpClient): void {
  server.tool(
    'interview_prediction',
    '面试押题（会员）。根据公司与岗位预测可能被问到的面试题，附带参考答案、答题思路与追问。需会员。',
    interviewPredictionSchema,
    async (args) => {
      const payload = args.resumeText
        ? {
            companyName: args.companyName,
            jobTitle: args.jobTitle,
            resumeText: args.resumeText,
            count: args.count,
          }
        : { companyName: args.companyName, jobTitle: args.jobTitle, count: args.count };
      const env = await client.post<PredictionResult>('/interview-prediction', payload);
      const d = env.data ?? ({} as PredictionResult);

      const questions = (d.questions ?? [])
        .map((q, i) => {
          const lines = [`${i + 1}. ${q.question ?? ''}`];
          if (q.category) lines.push(`   【${q.category}】`);
          if (q.referenceDirection) lines.push(`   答题方向：${q.referenceDirection}`);
          if (q.logicAndTips) lines.push(`   逻辑与技巧：${q.logicAndTips}`);
          if (q.referenceAnswer) lines.push(`   参考答案：${q.referenceAnswer}`);
          if (q.followUps && q.followUps.length) lines.push(`   追问：${q.followUps.join(' / ')}`);
          return lines.join('\n');
        })
        .join('\n\n');

      const header = `${d.company ?? ''} · ${d.jobTitle ?? ''} 面试押题（${d.questions?.length ?? 0} 题）`;

      return { content: [{ type: 'text', text: `${header}\n\n${questions}` }] };
    },
  );
}
