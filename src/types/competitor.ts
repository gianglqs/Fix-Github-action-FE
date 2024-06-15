export type competitor = {
   createdBy: string;
   createdAt: string;
   latestModifiedBy: string;
   latestModifiedAt: string;
   id: string;
   country: string;
   plant: string;
   competitorName: string;
   clazz: string;
   category: string;
   series: string;
   averageDN: string;
   chineseBrand: string;
   model: string;
   actual: number;
   competitorLeadTime: number;
   competitorPricing: number;
   dealerPremiumPercentage: string;
   dealerStreetPricing: string;
   dealerHandlingCost: string;
   dealerPricingPremiumPercentage: string;
   dealerPricingPremium: string;
   color: {
      id: number;
      groupName: string;
      colorCode: string;
   };
   battery: string;
   tonnage: string;
   origin: string;
   tableTitle: string;
   variancePercentage: string;
   dealerNet: number;
   marketShare: number;
   updateDate: string;
   aopf: number;
   lrff: number;
   hygleadTime: string;
};
type chartPoint = {
   x: number;
   y: number;
   r: number;
};
type chartGroup = {
   label: string;
   data: chartPoint[];
   backgroundColor: string;
};

export type TrendLine = {
   b: number;
   m: number;
};
export type ChartData = {
   dataset: chartGroup[];
   trendline: TrendLine | null;
   modeline: number | null;
   maxX: number;
   maxY: number;
};

export type ChartSelectedFilters = {
   regions: string | null;
   countries: string[];
   classes: string[];
   series: string[];
   models: string[];
   groups: string[];
   leadTime: string | null;
};
