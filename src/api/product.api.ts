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

   updateProduct = (data: any) => {
      return this.updateFile<any>(`product/updateProduct`, data);
   };

   // hashName of image are saved in DB
   getImage = (imageName: any) => {
      return this.get<any>(`loadImage/product/${imageName}`);
   };

   getProductDetailFilter = (modelCode, series) => {
      return this.get<any>('filters/productDetail', { modelCode, series });
   };

   getProductDetail = (modelCode, series) => {
      return this.get<any>('product/getProductDetail', { modelCode, series });
   };
}

const bookingApi = new ProductApi('product');

export default bookingApi;
