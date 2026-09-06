/**
 * 每个工具的入参 schema（zod）。与后端端点 1:1 对应，无任何计分/匹配逻辑。
 */

import { z } from 'zod';

export const searchArticlesSchema = {
  query: z.string().trim().min(1).max(100).describe('搜索关键词，例如「简历 自我介绍」'),
  limit: z.number().int().min(1).max(20).optional().describe('返回条数，默认 10'),
};

const hollandAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(60).describe('题目编号 1-60'),
  score: z.number().int().min(1).max(5).describe('喜欢程度：1 非常不喜欢 ~ 5 非常喜欢'),
});

export const hollandSchema = {
  answers: z
    .array(hollandAnswerSchema)
    .max(60)
    .optional()
    .describe('60 题答案数组；留空则只下发题目'),
};

export const interviewQuestionsSchema = {
  action: z
    .enum(['sections', 'questions', 'check'])
    .describe('sections=查看分类树 / questions=抽题（不含答案）/ check=提交答案判分'),
  section: z.string().optional().describe('行测大类，如 verbal / quantitative / judgment / data_analysis / professional'),
  subsection: z.string().optional().describe('子题型 key'),
  company: z.string().optional().describe('企业真题来源，如 kimberly / chinamobile'),
  difficulty: z.number().int().min(1).max(5).optional().describe('难度 1-5'),
  count: z.number().int().min(1).max(20).optional().describe('抽题数量，默认 10'),
  questionId: z.number().int().positive().optional().describe('check 时必填：题目 id'),
  userAnswer: z.string().optional().describe('check 时必填：所选选项 key（如 A/B/C/D）'),
};

export const resumeDiagnoseSchema = {
  resumeText: z.string().trim().min(20).max(8000).describe('简历全文文本（纯文本）'),
};

export const resumeRewriteSchema = {
  resumeText: z.string().trim().min(20).max(8000).describe('简历全文文本（纯文本）'),
};

export const resumeTailorSchema = {
  resumeText: z.string().trim().min(20).max(8000).describe('简历全文文本（纯文本）'),
  jdText: z.string().trim().min(20).max(6000).describe('目标岗位 JD 全文（纯文本）'),
};

export const interviewCoachSchema = {
  question: z.string().trim().min(2).max(2000).describe('面试题'),
  userAnswer: z.string().trim().min(2).max(5000).describe('你的回答'),
  resumeText: z.string().trim().min(20).max(8000).optional().describe('简历全文（可选，用于个性化点评）'),
};

export const interviewPredictionSchema = {
  companyName: z.string().trim().min(1).max(200).describe('公司名'),
  jobTitle: z.string().trim().min(1).max(200).describe('岗位名'),
  resumeText: z.string().trim().min(20).max(8000).optional().describe('简历全文（可选，用于个性化出题）'),
  count: z.number().int().min(1).max(20).optional().describe('题目数量，默认 8'),
};

export const ocrExamSearchSchema = {
  imageBase64: z
    .string()
    .trim()
    .min(1)
    .describe('题目图片的 base64 编码（可含 data:image/...;base64, 前缀，建议 ≤ 6MB）'),
};
