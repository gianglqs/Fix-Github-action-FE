import HttpService from '@/helper/HttpService';

class BookingApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/booking`);
   };

   importBookedFile = (data: any) => {
      return this.importData<any>('import-booking/import-booked-file', data);
   };

   importCostDataFile = (data: any) => {
      return this.importData<any>('import-booking/import-cost-data-file', data);
   };
}

const bookingApi = new BookingApi('bookingOrder');

export default bookingApi;
