import HttpService from '@/helper/HttpService';
import { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';
class ExportApi extends HttpService {
   exportTableToExcelFile = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`export-data-table/export-table-to-excel-file`, data, {
         params,
         responseType,
      });
   };
   exportSimulationModelingTableToExcelFile = <T = any>(
      data = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(
         `export-data-table/export-simuliation-modeling-table-to-excel-file`,
         data
      );
   };
}

const api = new ExportApi('');

export default api;
