import type { NewsItem } from '../types';
import { BaseNewsSource } from './base';
import { PANewsAdapter } from '../adapters/panews';
import Parser from 'rss-parser';

export class PANewsSource extends BaseNewsSource {
  name = 'PANews';
  private url = 'https://rss.panewslab.com/zh/tvsq/rss';
  private parser = new Parser();
  private adapter = new PANewsAdapter();

  async fetchSourceData(): Promise<Parser.Output<any>> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error(`获取PANews数据失败: ${response.statusText}`);
    }
    const text = await response.text();
    return this.parser.parseString(text);
  }
  
  adaptSourceData(sourceData: any): NewsItem[] {
    if (!sourceData) {
      return [];
    }
    return this.adapter.adapt(sourceData, this.name);
  }
} 