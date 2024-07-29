import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class BookingMarginTrialTestApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/bookingMarginTrialTest`);
   };

   getBookingMarginTrialTest = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      return this.instance.post<T>(`bookingFPA/getBookingMarginTrialTest`, data, {
         params,
         responseType,
      });
   };
   importDataBookingFPA = (data: any) => {
      return this.importData<any>('bookingFPA/importNewBookingFPA', data);
   };
}

const bookingMarginTrialTestApi = new BookingMarginTrialTestApi('bookingMarginTrialTest');

export default bookingMarginTrialTestApi;
