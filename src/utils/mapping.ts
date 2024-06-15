//types
import { FilterOptions } from '@/types';
import { ChartData } from '@/types/competitor';
export const mapCompetitorFiltersToOptionValues = (filters): FilterOptions => {
   Object.keys(filters).forEach((field) => {
      filters[field] = filters[field]?.map((value) => ({ value })) || [];
   });
   return filters;
};
export const mappingCompetitorsToChartData = ({ chartData, trendline, modeline }) => {
   const dataset = [];

   //calculate max values
   const maxX = Math.max(...chartData.map((competitor) => competitor?.competitorLeadTime || 0));
   const maxY = Math.max(...chartData.map((competitor) => competitor?.competitorPricing || 0));

   chartData.forEach((competitor) => {
      const existedGroup = dataset.find(
         (chartData) => chartData.label == competitor?.color?.groupName || ''
      );
      const data = {
         x: competitor?.competitorLeadTime || 0.0,
         y: competitor?.competitorPricing || 0.0,
         r: 5 || 0.0,
      };
      if (existedGroup) {
         existedGroup.data.push(data);
      } else {
         dataset.push({
            label: competitor.color.groupName,
            data: [data],
            backgroundColor: competitor.color.colorCode,
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
