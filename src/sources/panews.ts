import type { NewsItem } from '../types';
import { BaseNewsSource } from './base';
import { PANewsAdapter } from '../adapters/panews';
import Parser from 'rss-parser';

export class PANewsSource extends BaseNewsSource {
  name = 'PANews';
  private adapter = new PANewsAdapter();
  private parser = new Parser();

  async fetchSourceData(): Promise<any> {
    const rssUrl = 'https://rss.panewslab.com/zh/tvsq/rss';
    
    try {
      const feed = await this.parser.parseURL(rssUrl);
      return feed;
    } catch (error) {
      console.error('获取PANews RSS数据失败:', error);
      return null;
    }
  }

  adaptSourceData(sourceData: any): NewsItem[] {
    if (!sourceData) {
      return [];
    }
    return this.adapter.adapt(sourceData, this.name);
  }
} 