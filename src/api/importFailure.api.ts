import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class ImportFailureApi extends HttpService<any> {
   getImportFailureList = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`importFailure/getImportFailureForTable`, data, {
         params,
         responseType,
      });
   };
}

const importFailure = new ImportFailureApi('importFailure');

export default importFailure;
