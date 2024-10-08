import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import {
   defaultValueCaculatorForAjustmentCost,
   defaultValueFilterOrder,
} from '@/utils/defaultValues';

export const name = 'adjustment';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   adjustmentList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterAdjustment: defaultValueFilterOrder as any,
   defaultValueCalculator: defaultValueCaculatorForAjustmentCost as any,
   dataFilter: defaultValueFilterOrder as any,
   dataAdjustment: {} as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
   loadingData: true as boolean,
};

const adjustmentSlice = createSlice({
   name,
   initialState,
   reducers: {
      setAdjustmentList(state, { payload }: PayloadAction<any[]>) {
         state.adjustmentList = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },
      setDefaultValueFilterAdjustment(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterAdjustment = {
            ...state.defaultValueFilterAdjustment,
            ...payload,
         };
      },
      setDefaultValueCalculator(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueCalculator = {
            ...state.defaultValueCalculator,
            ...payload,
         };
      },
      setDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.dataFilter = payload;
      },
      setDataAdjustment(state, { payload }: PayloadAction<any[]>) {
         state.dataAdjustment = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<any[]>) {
         state.serverTimeZone = payload;
      },
      setLastUpdatedTime(state, { payload }: PayloadAction<any[]>) {
         state.lastUpdatedTime = payload;
      },
      setLastUpdatedBy(state, { payload }: PayloadAction<any[]>) {
         state.lastUpdatedBy = payload;
      },
      setLoadingData(state, { payload }: PayloadAction<boolean>) {
         state.loadingData = payload;
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
export const selectAdjustmentList = createSelector(selectState, (state) => state.adjustmentList);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectDefaultValueFilterAdjustment = createSelector(
   selectState,
   (state) => state.defaultValueFilterAdjustment
);

export const selectDefaultValueCalculator = createSelector(
   selectState,
   (state) => state.defaultValueCalculator
);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectDataAdjustment = createSelector(selectState, (state) => state.dataAdjustment);
export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);
export const selectLoadingData = createSelector(selectState, (state) => state.loadingData);

export const { actions } = adjustmentSlice;

export default adjustmentSlice;
