/**
 * 配置读取（全部来自环境变量，无任何业务逻辑）。
 * INTERVIEWSAGE_API_KEY —— 必填，面面星网页端「会员中心 → API 密钥」生成。
 * INTERVIEWSAGE_BASE_URL —— 可选，默认生产环境。
 */

export interface Config {
  baseUrl: string;
  apiKey: string;
}

export function loadConfig(): Config {
  const baseUrl = (process.env.INTERVIEWSAGE_BASE_URL || 'https://www.interviewsage.cn').replace(/\/+$/, '');
  const apiKey = (process.env.INTERVIEWSAGE_API_KEY || '').trim();
  return { baseUrl, apiKey };
}
