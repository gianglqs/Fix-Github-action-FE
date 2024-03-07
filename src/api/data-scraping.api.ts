import HttpService from '@/helper/HttpService';

class DataScrapingApi extends HttpService<any> {
   scrapeData = (url) => {
      return this.get<any>(`web-scraping/scrape-data?url=${url}`);
   };
}

const dataScrapingApi = new DataScrapingApi('data-scraping');

export default dataScrapingApi;
