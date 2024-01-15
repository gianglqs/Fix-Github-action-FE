import HttpService from '@/helper/HttpService';

class ProductApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/booking`);
   };

   importDataProduct = (data: any) => {
      return this.importData<any>('product/getData', data);
   };
}

const bookingApi = new ProductApi('product');

export default bookingApi;
