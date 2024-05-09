import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterOrder } from '@/utils/defaultValues';

export const name = 'outlier';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   outlierList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterOutlier: defaultValueFilterOrder as any,
   dataFilter: {} as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
};

const outlierSlice = createSlice({
   name,
   initialState,
   reducers: {
      setOutlierList(state, { payload }: PayloadAction<any[]>) {
         state.outlierList = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setDefaultValueFilterOutlier(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterOutlier = {
            ...state.defaultValueFilterOutlier,
            ...payload,
         };
      },
      setDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.dataFilter = payload;
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
export const selectOutlierList = createSelector(selectState, (state) => state.outlierList);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectDefaultValueFilterOutlier = createSelector(
   selectState,
   (state) => state.defaultValueFilterOutlier
);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);
export const { actions } = outlierSlice;

export default outlierSlice;
