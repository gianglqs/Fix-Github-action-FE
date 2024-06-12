import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
export const name = 'indicatorv2';
export const resetState = createAction(`${name}/RESET_STATE`);
//types
import { FilterOptions } from '@/types';
import { ChartData } from '@/types/competitor';
import { ChartSelectedFilters } from '@/types/competitor';
import { InitReducer } from '@/types';
//others
import { defaultValueChartSelectedFilterIndicator } from '@/utils/defaultValues';
type IndicatorInitState = {
    // data to fill select options of chart
    chartFilterOptions: FilterOptions;
    // user's selected data of chart
    chartSelectedFilters: ChartSelectedFilters;
    // chart data
    chartData : ChartData
} & InitReducer;

export const initialState : IndicatorInitState = {
    chartFilterOptions : {},
    chartSelectedFilters : defaultValueChartSelectedFilterIndicator,
    chartData : [],
    serverTimeZone: '' ,
    lastUpdatedTime: '',
    lastUpdatedBy: '',
    loadingPage: false,
};

const indicatorSlice = createSlice({
   name,
   initialState,
   reducers: {
      setChartFilterOptions(state, { payload }: PayloadAction<FilterOptions>) {
         state.chartFilterOptions = payload;
      },
      setChartSelectedFilters(state, { payload }: PayloadAction<ChartSelectedFilters>) {
         state.chartSelectedFilters = payload;
      },
      setChartData(state,{payload}: PayloadAction<ChartData>) {
        state.chartData = payload
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

// Selectors
export const selectState = (state: RootReducerType) => state[name];

export const selectChartFilterOptions = createSelector(selectState, (state) => state.chartFilterOptions);

export const selectChartSelectedFilters = createSelector(selectState, (state) => state.chartSelectedFilters);

export const selectChartData = createSelector(
   selectState,
   (state) => state.ChartData
);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);

export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const selectLoadingPage = createSelector(selectState, (state) => state.loadingPage);

export const { actions } = indicatorSlice;


export default indicatorSlice;
