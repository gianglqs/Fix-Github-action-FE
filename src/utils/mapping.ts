//types
import { FilterOptions } from '@/types';
import { ChartData, CompetitorTableData, AVGStats, Competitor } from '@/types/competitor';
import { hexToRgb } from '@mui/material';
import { borderColor } from '@mui/system';
import { v4 as uuidv4 } from 'uuid';
export const mapCompetitorFiltersToOptionValues = (filters): FilterOptions => {
   Object.keys(filters).forEach((field) => {
      filters[field] = filters[field]?.map((value) => ({ value })) || [];
   });
   return filters;
};
function hexToRGBA(hex, opacity) {
   hex = hex.replace('#', '');

   let r = parseInt(hex.substring(0, 2), 16);
   let g = parseInt(hex.substring(2, 4), 16);
   let b = parseInt(hex.substring(4, 6), 16);

   opacity = Math.min(Math.max(opacity, 0), 1);

   return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
export const mappingCompetitorsToChartData = ({ chartData, trendline, modeline }): ChartData => {
   const dataset = [];

   //calculate max values
   const maxX =
      Math.max(...chartData.map((competitor) => competitor?.competitorLeadTime || 0)) * 1.2 + 5;
   const maxY =
      Math.max(...chartData.map((competitor) => competitor?.competitorPricing || 0)) * 1.2 + 5;

   chartData.forEach((competitor) => {
      const existedGroup = dataset.find(
         (chartData) => chartData.label == competitor?.color?.groupName || ''
      );
      const data = {
         x: competitor?.competitorLeadTime || 0.0,
         y: competitor?.competitorPricing || 0.0,
         r: Math.sqrt(competitor?.marketShare * 1000) || 0.0,
      };
      if (existedGroup) {
         existedGroup.data.push(data);
      } else {
         dataset.push({
            label: competitor.color.groupName,
            clip: false,
            data: [data],
            backgroundColor: hexToRGBA(competitor?.color?.colorCode, 0.7),
            borderColor: competitor?.color?.colorCode,
         });
      }
   });
   return {
      trendline,
      modeline,
      dataset,
      maxX,
      maxY,
   };
};

export const mappingCompetitorsToTableData = (data) => {
   const competitorTableData: CompetitorTableData = data?.competitorList?.map(
      (competitor: Competitor) => ({
         id: uuidv4(),
         region: competitor?.country?.region?.regionName || '',
         country: competitor?.country?.countryName || '',
         class: competitor?.clazz?.clazzName || '',
         series: competitor?.series || '',
         group: competitor?.color?.groupName || '',
         avgStreetPrice: competitor?.dealerStreetPricing || 0,
         avgPrice: competitor?.competitorPricing || 0,
         avgVariancePercentage: competitor?.variancePercentage || 0,
      })
   );

   const averageStats: AVGStats = {
      avgStreetPrice: data?.averageStats?.dealerStreetPricing || 0,
      avgPrice: data?.averageStats?.competitorPricing || 0,
      avgVariancePercentage: data?.averageStats?.variancePercentage || 0,
   };
   return {
      tableData: competitorTableData,
      averageStats,
      totalItems: data?.totalItems || 0,
      serverTimeZone: data?.serverTimeZone || '',
      lastUpdatedTime: data?.lastUpdatedTime || '',
      lastUpdatedBy: data?.lastUpdatedBy || '',
   };
};
