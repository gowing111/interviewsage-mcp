import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';

interface HealthData {
  status: string;
  planType: string;
  isMember: boolean;
  isPro: boolean;
  scopes: string[];
}

export function registerHealth(server: McpServer, client: McpClient): void {
  server.tool(
    'health',
    '检查面面星 MCP 连接与当前 API key 的会员权益状态（免费）。用于验证 key 是否有效、当前套餐档位。',
    {},
    async () => {
      const env = await client.get<HealthData>('/health');
      const d = env.data ?? ({} as HealthData);
      return {
        content: [
          {
            type: 'text',
            text: `连接正常。当前套餐：${d.planType ?? '未知'}，会员：${d.isMember ? '是' : '否'}，Pro：${d.isPro ? '是' : '否'}`,
          },
        ],
      };
    },
  );
}
