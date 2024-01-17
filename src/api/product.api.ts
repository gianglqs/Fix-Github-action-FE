import HttpService from '@/helper/HttpService';
import { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class ProductApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/product`);
   };

   importDataProduct = (data: any) => {
      return this.importData<any>('product/importData', data);
   };
   getListProduct = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`product/getData`, data, { params, responseType });
   };
}

const bookingApi = new ProductApi('product');

export default bookingApi;
