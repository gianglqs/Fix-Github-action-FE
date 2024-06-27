import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
export const name = 'indicatorV2';
export const resetState = createAction(`${name}/RESET_STATE`);
//types
import { FilterOptions } from '@/types';
import { ChartData, ChartSelectedFilters, CompetitorTableData, AVGStats } from '@/types/competitor';
import { InitReducer } from '@/types';
//others
import { defaultValueChartSelectedFilterIndicator } from '@/utils/defaultValues';
type IndicatorInitState = {
   // data to fill select options of chart
   chartFilterOptions: FilterOptions;
   // user's selected data of chart
   chartSelectedFilters: ChartSelectedFilters;
   // chart data
   chartData: ChartData;
   // table data
   tableData: CompetitorTableData;
   // average stats information
   averageStats: AVGStats;
   // total items for pagination
   totalItems: number;
} & InitReducer;

export const initialState: IndicatorInitState = {
   chartFilterOptions: {},
   chartSelectedFilters: defaultValueChartSelectedFilterIndicator,
   chartData: {
      dataset: [],
      trendline: null,
      modeline: null,
      maxX: 0,
      maxY: 0,
   },
   tableData: [],
   averageStats: {
      avgPrice: 0,
      avgStreetPrice: 0,
      avgVariancePercentage: 0,
   },
   totalItems: 0,
   serverTimeZone: '',
   lastUpdatedTime: '',
   lastUpdatedBy: '',
   loadingPage: true,
};

const indicatorSlice = createSlice({
   name,
   initialState,
   reducers: {
      setChartFilterOptions(state, { payload }: PayloadAction<FilterOptions>) {
         console.log(payload);
         state.chartFilterOptions = payload;
      },
      setChartSelectedFilters(state, { payload }: PayloadAction<ChartSelectedFilters>) {
         state.chartSelectedFilters = payload;
      },
      setChartData(state, { payload }: PayloadAction<ChartData>) {
         state.chartData = payload;
      },
      setTotal(state, { payload }: PayloadAction<number>) {
         state.totalItems = payload;
      },
      setTableData(state, { payload }: PayloadAction<CompetitorTableData>) {
         state.tableData = payload;
      },
      setAverageStats(state, { payload }: PayloadAction<AVGStats>) {
         state.averageStats = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<string>) {
         state.serverTimeZone = payload;
      },
      setLastUpdatedTime(state, { payload }: PayloadAction<string>) {
         state.lastUpdatedTime = payload;
      },
      setLastUpdatedBy(state, { payload }: PayloadAction<string>) {
         state.lastUpdatedBy = payload;
      },
      setLoadingPage(state, { payload }: PayloadAction<boolean>) {
         state.loadingPage = payload;
      },
   },
   extraReducers: {
      [resetState.type]() {
         return initialState;
      },
   },
});

export const sagaGetList = createAction(`${name}/GET_LIST`);

export const fetchTable = createAction(`${name}/FETCH_TABLE`);

// Selectors
export const selectState = (state: RootReducerType) => state[name];

export const selectChartFilterOptions = createSelector(
   selectState,
   (state) => state.chartFilterOptions
);

export const selectChartSelectedFilters = createSelector(
   selectState,
   (state) => state.chartSelectedFilters
);

export const selectChartData = createSelector(selectState, (state) => state.chartData);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);

export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const selectAVGState = createSelector(selectState, (state) => state.averageStats);

export const selectTableData = createSelector(selectState, (state) => state.tableData);

export const selectLoadingPage = createSelector(selectState, (state) => state.loadingPage);

export const { actions } = indicatorSlice;

export default indicatorSlice;
