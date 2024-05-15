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
   nearestExchangeRateList: [] as any[],
   dataFilter: {} as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
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
      setNearestExchangeRateList(state, { payload }: PayloadAction<any[]>) {
         state.nearestExchangeRateList = payload;
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
export const selectShipmentList = createSelector(selectState, (state) => state.shipmentList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectExchangeRateList = createSelector(
   selectState,
   (state) => state.exchangeRateList
);
export const selectNearestExchangeRateList = createSelector(
   selectState,
   (state) => state.nearestExchangeRateList
);
export const selectDefaultValueFilterOrder = createSelector(
   selectState,
   (state) => state.defaultValueFilterOrder
);
export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);
export const { actions } = shipmentSlice;

export default shipmentSlice;
