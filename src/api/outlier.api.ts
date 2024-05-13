import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class OutlierApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/outlier`);
   };

   getOutlier = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`table/getOutlierTable`, data, { params, responseType });
   };

   getOutliersForChart = <T = any>(data = {} as Record<string, any>, isBookingData: any) => {
      return this.post<T>(`chart/getOutliers`, data, { isBookingData });
   };

   //insert link api
   // getDataForChart = <T = any>(
   //    data = {} as Record<string, any>,
   //    params = {} as Record<string, any>,
   //    context: GetServerSidePropsContext = null as any,
   //    responseType = 'default' as ResponseType
   // ) => {
   //    this.saveToken(context);
   //    return this.instance.post<T>(`chart/`, data, {
   //       params,
   //       responseType,
   //    });
   // };
}

const outlierApi = new OutlierApi('outlier');

export default outlierApi;
