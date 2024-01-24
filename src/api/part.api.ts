import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class PartApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/productDetail`);
   };

   getPartsForProductDetail = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`part/getPartForTableProductDetail`, data, { params });
   };
}

const partApi = new PartApi('part');

export default partApi;
