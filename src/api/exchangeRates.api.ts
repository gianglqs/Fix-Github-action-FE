import HttpService from '@/helper/HttpService';

class ExchangeRatesApi extends HttpService<any> {
   getCurrencyFilter = () => {
      return this.get<any>(`filters/currency`);
   };

   compareCurrency = (data: any) => {
      return this.post<any>(`reports/compareCurrency`, data);
   };

   uploadExchangeRate = (data: any) => {
      return this.importData<any>('reports/uploadExchangeRate', data);
   };

   getExampleUploadFile = () => {
      return this.get<any>('reports/get-example-exchange-rate-upload');
   };
}

const exchangeRatesApi = new ExchangeRatesApi('exchangeRates');

export default exchangeRatesApi;
