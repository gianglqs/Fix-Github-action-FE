import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';

class MarginAnalysisApi extends HttpService<any> {
   getListMarginAnalysis = (data: any) => {
      return this.post<any>(`marginAnalystData`, {
         ...data,
      });
   };

   getListMarginAnalysisSummary = (data: any) => {
      return this.post<any>(`marginAnalystSummary`, {
         ...data,
      });
   };

   estimateMarginAnalystData = (data: any) => {
      return this.post<any>(`estimateMarginAnalystData`, { ...data });
   };
   getEstimateMarginAnalystData = (data: any) => {
      return this.post<any>(`getEstimateMarginAnalystData`, { ...data });
   };

   checkFilePlant = (data: any) => {
      return this.importData<any>('marginData/readNOVOFile', data);
   };

   importMacroFile = (requestId: string, data: any) => {
      return this.importData<any>('importMacroFile', data, { requestId });
   };

   importPowerBiFile = (data: any) => {
      return this.importData<any>('importPowerBiFile', data);
   };

   listHistoryMargin = (data: any) => {
      return this.post<any>('list-history-margin', data);
   };
   viewHistoryMargin = (data: any) => {
      return this.post<any>('view-history-margin', data);
   };
   saveMarginData = (data: any) => {
      return this.post<any>('save-margin-data', data);
   };
   deleteMarginData = (data: any) => {
      return this.delete<any>('delete-margin-data', data);
   };

   getPreviousDataView = () => {
      return this.get<any>('get-previous-data-view-quotation-margin');
   };

   getExampleUploadFile = () => {
      return this.get<any>('get-quotation-margin-example-upload');
   };
}

const marginAnalysisApi = new MarginAnalysisApi('QuotationMargin');

export default marginAnalysisApi;
