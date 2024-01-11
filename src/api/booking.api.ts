import HttpService from '@/helper/HttpService';

class BookingApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/booking`);
   };

   importDataBooking = (data: any) => {
      return this.importData<any>('importNewBooking', data);
   };
}

const bookingApi = new BookingApi('bookingOrder');

export default bookingApi;
