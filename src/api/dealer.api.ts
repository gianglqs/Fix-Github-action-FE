import HttpService from '@/helper/HttpService';

class DealerListingApi extends HttpService<any> {
   importDataDealer = (data: any) => {
      return this.importData<any>('importNewDealer', data);
   };
}

const dealerApi = new DealerListingApi('dealerListing');

export default dealerApi;
