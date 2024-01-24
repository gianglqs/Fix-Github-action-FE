import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterPart } from '@/utils/defaultValues';

export const name = 'part';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   partList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterPart: defaultValueFilterPart as any,
   exchangeRateList: [] as any[],
};

const partSlice = createSlice({
   name,
   initialState,
   reducers: {
      setPartList(state, { payload }: PayloadAction<any[]>) {
         state.partList = payload;
      },
      setExchangeRateList(state, { payload }: PayloadAction<any[]>) {
         state.exchangeRateList = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setDefaultValueFilterPart(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterPart = {
            ...state.defaultValueFilterPart,
            ...payload,
         };
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
export const selectPartList = createSelector(selectState, (state) => state.partList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectExchangeRateList = createSelector(
   selectState,
   (state) => state.exchangeRateList
);

export const selectDefaultValueFilterPart = createSelector(
   selectState,
   (state) => state.defaultValueFilterPart
);

export const { actions } = partSlice;

export default partSlice;
