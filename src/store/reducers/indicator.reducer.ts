import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterIndicator } from '@/utils/defaultValues';

export const name = 'indicator';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   indicatorList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterIndicator: defaultValueFilterIndicator as any,
   initDataForLineChartPlant: [] as any[],
   initDataForLineChartRegion: [] as any[],
   initDataForCompetitiveLandscape: [] as any[],
   dataFilter: {} as any,
   dataFilterBubbleChart: {
      regions: '',
      countries: [],
      classes: [],
      categories: [],
      series: [],
   } as any,
   serverTimeZone: '' as any,
   latestUpdatedTime: '' as any,
};

const indicatorSlice = createSlice({
   name,
   initialState,
   reducers: {
      setIndicatorList(state, { payload }: PayloadAction<any[]>) {
         state.indicatorList = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setDefaultValueFilterIndicator(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterIndicator = {
            ...state.defaultValueFilterIndicator,
            ...payload,
         };
      },
      setInitDataForLineChartPlant(state, { payload }: PayloadAction<any[]>) {
         state.initDataForLineChartPlant = payload;
      },
      setInitDataForLineChartRegion(state, { payload }: PayloadAction<any[]>) {
         state.initDataForLineChartRegion = payload;
      },
      setInitDataForCompetitiveLandscape(state, { payload }: PayloadAction<any[]>) {
         state.initDataForCompetitiveLandscape = payload;
      },
      setDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.dataFilter = payload;
      },
      setDataFilterBubbleChart(state, { payload }: PayloadAction<any[]>) {
         state.dataFilterBubbleChart = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<any[]>) {
         state.serverTimeZone = payload;
      },
      setLatestUpdatedTime(state, { payload }: PayloadAction<any[]>) {
         state.latestUpdatedTime = payload;
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
export const selectIndicatorList = createSelector(selectState, (state) => state.indicatorList);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectDataForLineChartRegion = createSelector(
   selectState,
   (state) => state.initDataForLineChartRegion
);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectDataFilterBubbleChart = createSelector(
   selectState,
   (state) => state.dataFilterBubbleChart
);

export const selectDataForLineChartPLant = createSelector(
   selectState,
   (state) => state.initDataForLineChartPlant
);

export const selectDataForCompetitveLandscape = createSelector(
   selectState,
   (state) => state.initDataForCompetitiveLandscape
);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);

export const selectDefaultValueFilterIndicator = createSelector(
   selectState,
   (state) => state.defaultValueFilterIndicator
);

export const { actions } = indicatorSlice;

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLatestUpdatedTime = createSelector(
   selectState,
   (state) => state.latestUpdatedTime
);

export default indicatorSlice;
