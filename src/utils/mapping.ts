//types
import { FilterOptions } from "@/types"
import { ChartData } from "@/types/competitor";
export const mapCompetitorFiltersToOptionValues  = (filters) : FilterOptions =>{
    Object.keys(filters).forEach(field => {
        filters[field] = filters[field]?.map( value =>({value})) ||[];
    });
    return filters;
}
export const mappingCompetitorsToChartData = ({chartData,trendline}) : ChartData => {
 return {
    trendline,
    dataset: chartData.map(({color,competitorLeadTime,competitorPricing,marketShare}) =>({
    color,
    competitorLeadTime,
    competitorPricing,
    marketShare 
 }))};
}