import HttpService from '@/helper/HttpService';

class CheckProcessingApi extends HttpService {
   checkProcessing = (data: any) => {
      return this.get<any>(`/processing/is-processing`, data);
   };
}

const api = new CheckProcessingApi('');

export default api;
