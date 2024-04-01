import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class PriceVolumeSensitivityApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/booking`);
   };

   getPriceVolumeSensitivity = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`priceVolSensitivity/getDataForTable`, data, {
         params,
         responseType,
      });
   };
}

const priceVolumeSensitivityApi = new PriceVolumeSensitivityApi('priceVolumeSensitivity');

export default priceVolumeSensitivityApi;
