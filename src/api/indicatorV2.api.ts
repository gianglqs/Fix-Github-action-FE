import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';
import { ca } from 'date-fns/locale';
//types
import { ChartSelectedFilters } from '@/types/competitor';
class IndicatorV2Api extends HttpService<any> {
   getChartData = (data = {} as ChartSelectedFilters) => {
      return this.post<any>(`chart/getDataForCompetitorBubbleChartV2`, { ...data });
   };
   getCompetitorData = (
      data = {} as ChartSelectedFilters,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      return this.post<any>(`getCompetitorDataV2`, { ...data }, { ...params, responseType });
   };
   getChartFilters = (data = {} as ChartSelectedFilters) => {
      return this.post<any>(`filters/competitorPricingV2`, { ...data });
   };
}

const indicatorV2Api = new IndicatorV2Api('indicatorV2');
export default indicatorV2Api;
