import type { Output as RssOutput } from 'rss-parser';
import type { NewsItem } from '../types';
import { RssAdapter } from './rss';

interface PANewsRssItem {
  description?: string;
}

export class PANewsAdapter extends RssAdapter {
  private convertHtmlToMarkdown(htmlContent: string): string {
    let markdownContent = htmlContent

    // 替换换行标签
    markdownContent = markdownContent.replace(/<\/?p>/gi, '\n\n');

    return markdownContent.trim();
  }

  adapt(feed: RssOutput<PANewsRssItem>, sourceName: string): NewsItem[] {
    feed.items = feed.items.map((item) => {
      return {
        ...item,
        content: this.convertHtmlToMarkdown(item.description || '')
      };
    });

    return super.adapt(feed, sourceName);
  }
} 