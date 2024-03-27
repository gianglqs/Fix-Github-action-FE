import HttpService from '@/helper/HttpService';

class VolumeDiscountApi extends HttpService<any> {
   calculateVolumeDiscount = <T = any>(data = {}) => {
      return this.instance.post<T>('volume-discount-analysis/calculate-volume-discount', data);
   };

   getSegmentFilters = () => {
      return this.get<any>('filters/segments');
   };
}

const volumeDiscountApi = new VolumeDiscountApi('volume-discount');
export default volumeDiscountApi;
