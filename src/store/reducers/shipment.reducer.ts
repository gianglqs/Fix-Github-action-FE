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
   dataFilter: defaultValueFilterOrder as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
   currency: 'USD',
   loadingData: true as boolean,
   exampleUploadFile: {} as any,
};

const shipmentSlice = createSlice({
   name,
   initialState,
   reducers: {
      setShipmentList(state, { payload }: PayloadAction<any[]>) {
         state.shipmentList = payload;
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
      setCurrency(state, { payload }: PayloadAction<string>) {
         state.currency = payload;
      },
      setLoadingData(state, { payload }: PayloadAction<boolean>) {
         state.loadingData = payload;
      },
      setExampleUploadFile(state, { payload }: PayloadAction<any>) {
         state.exampleUploadFile = payload;
      },
   },
   extraReducers: {
      [resetState.type]() {
         return initialState;
      },
   },
});

export const sagaGetList = createAction(`${name}/GET_LIST`);
export const actionSwitchCurrency = createAction(`${name}/switchCurrency`);

// Selectors
export const selectState = (state: RootReducerType) => state[name];
export const selectShipmentList = createSelector(selectState, (state) => state.shipmentList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);

export const selectDefaultValueFilterOrder = createSelector(
   selectState,
   (state) => state.defaultValueFilterOrder
);
export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);
export const selectCurrency = createSelector(selectState, (state) => state.currency);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);
export const selectLoadingData = createSelector(selectState, (state) => state.loadingData);
export const selectExampleUploadFile = createSelector(
   selectState,
   (state) => state.exampleUploadFile
);
export const { actions } = shipmentSlice;

export default shipmentSlice;
