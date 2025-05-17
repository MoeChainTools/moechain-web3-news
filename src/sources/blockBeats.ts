import type { NewsItem } from '../types';
import { BaseNewsSource } from './base';
import { BlockBeatsAdapter } from '../adapters/blockBeats';

interface FlashResponse {
  status: number;
  message: string;
  data: {
    page: number;
    data: Flash[];
  };
}

interface Flash {
  id: number;
  title: string;
  content: string;
  pic: string; 
  link: string;
  url: string;
  create_time: string;
} 

export class BlockBeatsNewsSource extends BaseNewsSource {
  name = 'BlockBeats News';
  private adapter = new BlockBeatsAdapter();

  async fetchSourceData(): Promise<Flash[] | undefined> {
    const apiUrl = new URL('open-api/open-flash', 'https://api.theblockbeats.news/v1/')
    apiUrl.search = new URLSearchParams({
      size: '20',
      page: '1',
      lang: 'cn',
    }).toString()

    const response = await fetch(apiUrl)

    if (response.ok) {
      const data = (await response.json()) as FlashResponse
      if (data.status === 0) {
        return data.data.data
      }
    }
  }

  adaptSourceData(sourceData: Flash[] | undefined): NewsItem[] {
    if (!sourceData) {
      return [];
    }
    return this.adapter.adapt(sourceData, this.name);
  }
} 