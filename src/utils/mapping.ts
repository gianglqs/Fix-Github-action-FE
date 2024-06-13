//types
import { FilterOptions } from "@/types"
import { ChartData } from "@/types/competitor";
export const mapCompetitorFiltersToOptionValues  = (filters) : FilterOptions =>{
    Object.keys(filters).forEach(field => {
        filters[field] = filters[field]?.map( value =>({value})) ||[];
    });
    return filters;
}
export const mappingCompetitorsToChartData = (competitors) : ChartData => {
 return competitors.map(({color,competitorLeadTime,competitorPricing,marketShare}) =>({
    color,
    competitorLeadTime,
    competitorPricing,
    marketShare 
 }));
}