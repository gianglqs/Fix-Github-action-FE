import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterOrder } from '@/utils/defaultValues';

export const name = 'shipment';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   shipmentList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterOrder: defaultValueFilterOrder as any,
   exchangeRateList: [] as any[],
};

const shipmentSlice = createSlice({
   name,
   initialState,
   reducers: {
      setShipmentList(state, { payload }: PayloadAction<any[]>) {
         state.shipmentList = payload;
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
      setDefaultValueFilterOrder(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterOrder = {
            ...state.defaultValueFilterOrder,
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
export const selectShipmentList = createSelector(selectState, (state) => state.shipmentList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectExchangeRateList = createSelector(
   selectState,
   (state) => state.exchangeRateList
);
export const selectDefaultValueFilterOrder = createSelector(
   selectState,
   (state) => state.defaultValueFilterOrder
);

export const { actions } = shipmentSlice;

export default shipmentSlice;
