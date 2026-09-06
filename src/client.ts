/**
 * 薄 HTTPS 客户端：拼 URL → 加鉴权头 → 转发 → 错误透传。
 * 只做水管，不解析、不加工业务数据。
 */

import { loadConfig } from './config.js';

export interface BackendEnvelope<T = unknown> {
  v: number;
  data?: T;
  error?: string;
  message?: string;
  upgradeUrl?: string;
}

const TIMEOUT_MS = 30_000;

export class McpClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const cfg = loadConfig();
    this.baseUrl = cfg.baseUrl;
    this.apiKey = cfg.apiKey;
  }

  private ensureKey(): void {
    if (!this.apiKey) {
      throw new Error(
        '未配置 INTERVIEWSAGE_API_KEY。请到面面星网页端「会员中心 → API 密钥」生成，并在 MCP 配置的 env 中填入。',
      );
    }
  }

  async request<T = unknown>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<BackendEnvelope<T>> {
    this.ensureKey();

    const url = `${this.baseUrl}/api/v1/mcp${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    let json: BackendEnvelope<T>;
    try {
      json = (await res.json()) as BackendEnvelope<T>;
    } catch {
      throw new Error(`面面星服务返回异常（HTTP ${res.status}），请稍后再试`);
    }

    if (!res.ok) {
      const message = json?.message || `请求失败（HTTP ${res.status}）`;
      const upgrade = json?.upgradeUrl ? `\n开通会员：${json.upgradeUrl}` : '';
      throw new Error(`${message}${upgrade}`);
    }

    return json;
  }

  get<T = unknown>(path: string): Promise<BackendEnvelope<T>> {
    return this.request<T>('GET', path);
  }

  post<T = unknown>(path: string, body: unknown): Promise<BackendEnvelope<T>> {
    return this.request<T>('POST', path, body);
  }
}
