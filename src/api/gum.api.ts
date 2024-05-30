import HttpService from '@/helper/HttpService';

type getGumStatsParams = {
    year: number,
    month: number
}
class GumApi extends HttpService<any> {
   getGumStats = <T = any>(data : getGumStatsParams) => {
      return this.instance.post<T>('gum/getReport', data);
   };

   getGroupingCriteria = () => {
      return this.post<{segments: any; regions:any}>('gum/getGroupingCriteria');
   };
}

const gumApi = new GumApi('gumReport');
export default gumApi;
