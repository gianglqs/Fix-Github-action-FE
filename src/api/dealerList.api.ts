import HttpService from '@/helper/HttpService';

class DealerListingApi extends HttpService<any> {
   importDataDealerListing = (data: any) => {
      return this.importData<any>('importNewDealerListing', data);
   };
}

const dealerListingApi = new DealerListingApi('dealerListing');

export default dealerListingApi;
