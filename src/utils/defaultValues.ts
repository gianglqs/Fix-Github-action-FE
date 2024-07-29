import { ImportTrackingDataFilter, ResidualValueDataFilter } from '@/types/defaultValue';
import { ChartSelectedFilters } from '@/types/competitor';
export const defaultValueFilterIndicator = {
   regions: [],
   dealers: [],
   plants: [],
   metaSeries: [],
   classes: [],
   models: [],
   segments: [],
   aopMarginPercentageGroup: '',
   marginPercentage: '',
   chineseBrand: '',
   series: [],
   countries: [],
   competitorNames: [],
} as any;

export const defaultValueFilterOrder = {
   orderNo: '',
   regions: [],
   dealers: [],
   plants: [],
   metaSeries: [],
   classes: [],
   models: [],
   segments: [],
   aopMarginPercentageGroup: '',
   marginPercentage: '',
   fromDate: '',
   toDate: '',
   marginPercentageAfterAdj: '',
} as any;

export const defaultValueFilterTrends = {
   regions: [],
   dealers: [],
   plants: [],
   metaSeries: [],
   classes: [],
   models: [],
   segments: [],
   years: [],
};
export const defaultValueCaculatorForAjustmentCost = {
   costAdjPercentage: '0',
   freightAdj: '0',
   fxAdj: '0',
   dnAdjPercentage: '0',
};

export const defaultValueFilterProduct = {
   modelCode: '',
   plants: [],
   metaSeries: [],
   classes: [],
   segments: [],
   brands: [],
   family: [],
   truckType: [],
} as any;

export const defaultValueFilterPart = {
   modelCode: '',
   orderNumbers: [],
} as any;

export const defaultValueFilterAdmin = {
   filter: '',
};

export const defaultValueFilterVolumeDiscount = {
   pricePerUnit: { value: 0, error: false },
   costOfGoodSold: { value: 0, error: false },
   discountPercentage: { value: 0, error: false },
   lever: { value: '', error: false },
   expectedUnitSales: { value: '', error: false },
   ocos: { value: '', error: false },
   segment: { value: '', error: false },
};

export const defaultValueFilterResidualValue = {
   modelType: null,
   brand: null,
   modelCode: null,
   year: '2',
   price: 0,
} as ResidualValueDataFilter;

export const defaultValueFilterImportTracking = {
   date: '',
} as ImportTrackingDataFilter;

export const defaultDataFilterQuotationMargin = {
   region: 'Asia',
   currency: 'USD',
   orderNumber: null,
   type: null,
   modelCode: null,
   series: null,
   subRegion: 'Australia',
   delivery: 'DDP',
};

export const defaultValueChartSelectedFilterIndicator: ChartSelectedFilters = {
   region: null,
   countries: [],
   classes: [],
   metaSeries: [],
   models: [],
   groups: [],
   leadTime: null,
};

export const defaultValueSelectedFilterLongTermRental = {
   series: null,
   modelCode: null,
};

export const defaultValueSelectedFilterExchangeRate = {
   fromDate: { value: '' },
   toDate: { value: '' },
   currentCurrency: { value: '', error: false },
   comparisonCurrencies: {
      value: [],
      error: false,
   },
};
