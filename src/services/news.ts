import { BWENewsSource } from '../sources/bwe';
import { BlockBeatsNewsSource } from '../sources/blockBeats';
import { PANewsSource } from '../sources/panews';
import type { NewsSource, NewsFilter, PushService } from '../types';
import logger from '../utils/logger';

export default abstract class NewsService {
  protected sources: NewsSource[] = [new BWENewsSource(), new BlockBeatsNewsSource(), new PANewsSource()];
  protected pushService: PushService;
  protected filterService: NewsFilter;

  constructor(pushService: PushService, filterService: NewsFilter) {
    this.pushService = pushService;
    this.filterService = filterService;
  }

  async fetchAndPushNews(): Promise<void> {
    logger.debug('开始获取新闻...');
    
    for (const source of this.sources) {
      try {
        logger.info(`从 ${source.name} 获取新闻...`);
        const news = await source.fetchNews();
        
        if (news.length > 0) {
          logger.info(`获取到 ${news.length} 条新闻，准备过滤和推送...`);
          
          const newsToPush = await this.filterService.filter(news);
          
          logger.info(`过滤后有 ${newsToPush.length} 条新闻需要推送`);
          
          if (newsToPush.length > 0) {
            logger.groupStart('开始推送新闻');
            
            let completed = 0;
            const total = newsToPush.length;
            
            for (let i = 0; i < total; i++) {
              const item = newsToPush[i];
              const success = await this.pushService.push(item);
              
              if (success) {
                await this.filterService.add(item);
                logger.success(`成功推送并保存新闻: ${item.title}`);
                completed++;
                logger.progress('推送进度', (completed / total) * 100);
              }
            }
            
            logger.groupEnd();
          }
        } else {
          logger.info('没有新的新闻需要推送');
        }
      } catch (error) {
        logger.error(`处理 ${source.name} 新闻源时出错:`, error);
      }
    }
    
    logger.debug('新闻处理完成');
  }
} 