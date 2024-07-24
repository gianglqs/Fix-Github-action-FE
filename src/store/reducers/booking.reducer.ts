import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterOrder } from '@/utils/defaultValues';

export const name = 'booking';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   bookingOrdersList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterBooking: defaultValueFilterOrder as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
   dataFilter: defaultValueFilterOrder as any,
   currency: 'USD',
   loadingData: true as boolean,
   exampleUploadFile: {} as any,
};

const bookingSlice = createSlice({
   name,
   initialState,
   reducers: {
      setBookingList(state, { payload }: PayloadAction<any[]>) {
         state.bookingOrdersList = payload;
      },

      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
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
      setDefaultValueFilterBooking(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterBooking = {
            ...state.defaultValueFilterBooking,
            ...payload,
         };
      },
      setDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.dataFilter = payload;
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
export const selectBookingList = createSelector(selectState, (state) => state.bookingOrdersList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);

export const selectDefaultValueFilterBooking = createSelector(
   selectState,
   (state) => state.defaultValueFilterBooking
);
export const selectCurrency = createSelector(selectState, (state) => state.currency);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);
export const selectLoadingData = createSelector(selectState, (state) => state.loadingData);
export const selectExampleUploadFile = createSelector(
   selectState,
   (state) => state.exampleUploadFile
);

export const { actions } = bookingSlice;

export default bookingSlice;
