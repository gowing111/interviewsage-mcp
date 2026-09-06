import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpClient } from '../client.js';
import { searchArticlesSchema } from '../schemas.js';

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  url: string;
}

interface SearchResult {
  list: ArticleMeta[];
  total: number;
}

export function registerSearchArticles(server: McpServer, client: McpClient): void {
  server.tool(
    'search_articles',
    '检索面面星求职干货文章（免费，零 AI）。输入关键词返回匹配的文章标题、摘要与阅读链接，覆盖简历、面试、笔试、职业规划等求职方法论。',
    searchArticlesSchema,
    async (args) => {
      const env = await client.post<SearchResult>('/search-articles', args);
      const { list, total } = env.data ?? { list: [], total: 0 };

      if (total === 0) {
        return { content: [{ type: 'text', text: '没有找到匹配的文章，换个关键词试试。' }] };
      }

      const text = list
        .map((a, i) => `${i + 1}. ${a.title}\n   ${a.description || ''}\n   ${a.url}`)
        .join('\n\n');

      return {
        content: [
          { type: 'text', text: `共 ${total} 篇匹配（展示前 ${list.length} 篇）：\n\n${text}` },
        ],
      };
    },
  );
}
