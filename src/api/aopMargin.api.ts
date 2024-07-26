import HttpService from '@/helper/HttpService';

class AOPMarginApi extends HttpService<any> {
   importDataAOPMargin = (data: any) => {
      return this.importData<any>('aopmargin/importData', data);
   };
}

const aopmarginApi = new AOPMarginApi('AOPMarginApi');

export default aopmarginApi;
