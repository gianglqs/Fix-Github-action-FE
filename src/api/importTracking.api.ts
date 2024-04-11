import HttpService from '@/helper/HttpService';

class ImportTrackingApi extends HttpService<any> {
   getListDataImportTracking = (date: string) => {
      return this.getDataList<any>('importTracking/getDataImportTracking', { date });
   };
}

const importTrackingApi = new ImportTrackingApi('importTracking');

export default importTrackingApi;
