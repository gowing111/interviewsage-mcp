import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { ocrExamSearchSchema } from '../schemas.js';

interface OcrExamResult {
  subject?: string;
  questionType?: string;
  questionText?: string;
  options?: Array<{ key: string; text: string }>;
  answer?: string | null;
  analysis?: string | null;
  knowledgePoint?: string | null;
  difficulty?: string | null;
  ocrText?: string;
  confidence?: number | null;
}

export function registerOcrExamSearch(server: McpServer, client: McpClient): void {
  server.tool(
    'ocr_exam_search',
    'OCR 拍照搜题（Pro 专属，月度额度）。上传题目图片的 base64，识别题干并返回结构化题目、答案与解析。仅限合法学习用途。',
    ocrExamSearchSchema,
    async (args) => {
      const env = await client.post<OcrExamResult>('/ocr-exam-search', {
        imageBase64: args.imageBase64,
      });
      const d = env.data ?? ({} as OcrExamResult);

      const options = (d.options ?? [])
        .map((o) => `  ${o.key}. ${o.text}`)
        .join('\n');
      const typeLabel =
        ({ single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题', essay: '简答题' } as Record<string, string>)[
          d.questionType ?? ''
        ] ?? d.questionType;

      const text = [
        d.subject ? `科目：${d.subject}` : null,
        typeLabel ? `题型：${typeLabel}` : null,
        d.difficulty ? `难度：${d.difficulty}` : null,
        d.questionText ? `\n题干：\n${d.questionText}` : '',
        options ? `\n选项：\n${options}` : '',
        d.answer ? `\n答案：${d.answer}` : '',
        d.analysis ? `\n解析：${d.analysis}` : '',
        d.knowledgePoint ? `\n考点：${d.knowledgePoint}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      return { content: [{ type: 'text', text }] };
    },
  );
}
