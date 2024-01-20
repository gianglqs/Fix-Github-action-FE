import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class PartApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/part`);
   };

   getParts = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`part/getParts`, data, { params, responseType });
   };
}

const partApi = new PartApi('part');

export default partApi;
