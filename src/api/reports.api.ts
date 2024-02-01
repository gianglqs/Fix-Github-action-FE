import HttpService from '@/helper/HttpService';
import { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class ReportsApi extends HttpService<any> {
   getCurrencyFilter = () => {
      return this.get<any>(`filters/currency`);
   };

   compareCurrency = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`reports/compareCurrency`, data, { params, responseType });
   };

   uploadExchangeRate = (data: any) => {
      return this.importData<any>('reports/uploadExchangeRate', data);
   };
}

const reportsApi = new ReportsApi('reports');

export default reportsApi;
