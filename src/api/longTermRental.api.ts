import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';
import { ca } from 'date-fns/locale';
class LongTermRentalApi extends HttpService<any> {
   getSelectFilters = (data = {} as any) => {
      return this.post<any>(`filters/longTermRental`, { ...data });
   };
}

const longTermRentalApi = new LongTermRentalApi('longTermRental');
export default longTermRentalApi;
