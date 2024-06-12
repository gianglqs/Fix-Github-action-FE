import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';
import { ca } from 'date-fns/locale';
//types
import { ChartSelectedFilters } from '@/types/competitor';
class IndicatorV2Api extends HttpService<any> {
    getChartData = (data: ChartSelectedFilters) => {
        return this.post<any>(`chart/getDataForCompetitorBubbleChartV2`, { ...data });
     };
    
    getChartFilters = (data: ChartSelectedFilters) => {
        return this.get<any>(`filters/competitorPricingV2`, { ...data });
     };
    }

const indicatorV2Api = new IndicatorV2Api('indicatorV2');
export default indicatorV2Api;