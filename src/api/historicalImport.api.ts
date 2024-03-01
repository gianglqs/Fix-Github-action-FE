import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class HistoricalImportApi extends HttpService<any> {
   getListHistoricalImport = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`fileUpload/getDataForTable`, data, { params, responseType });
   };
}

const adjustmentApi = new HistoricalImportApi('historicalImport');

export default adjustmentApi;
