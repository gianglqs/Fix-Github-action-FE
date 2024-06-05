import HttpService from '@/helper/HttpService';
import { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';
class CommonApi extends HttpService {
   getAllDataForExport = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`export-data-table/get-all-data-for-export-table`, data, {
         params,
         responseType,
      });
   };
}

const api = new CommonApi('');

export default api;
