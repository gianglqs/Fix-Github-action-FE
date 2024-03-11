import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class IndicatorApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/competitorPricing`);
   };

   getDataLineChartPlant = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`chart/getDataForPlantLineChart`, data, {
         params,
         responseType,
      });
   };

   getCompetitiveLandscape = (data: any) => {
      return this.post<any>(`chart/getDataForCompetitorBubbleChart`, { ...data });
   };

   getDataLineChartRegion = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`chart/getDataForRegionLineChart`, data, {
         params,
         responseType,
      });
   };

   getIndicators = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`getCompetitorData`, data, { params, responseType });
   };

   importIndicatorFile = (data: any) => {
      return this.importData<any>('importIndicatorsFile', data);
   };

   importForecastFile = (data: any) => {
      return this.importData<any>('uploadForecastFile', data);
   };

   getCountryByRegion = (region, context: GetServerSidePropsContext = null as any) => {
      this.saveToken(context);
      return this.instance.get(`filters/competitorPricing/get-country-name?region=${region}`);
   };
}

const indicatorApi = new IndicatorApi('indicator');

export default indicatorApi;
