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
   exchangeRateList: [] as any[],
   nearestExchangeRateList: [] as any[],
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
   dataFilter: {} as any,
};

const bookingSlice = createSlice({
   name,
   initialState,
   reducers: {
      setBookingList(state, { payload }: PayloadAction<any[]>) {
         state.bookingOrdersList = payload;
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
export const selectBookingList = createSelector(selectState, (state) => state.bookingOrdersList);
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

export const selectDefaultValueFilterBooking = createSelector(
   selectState,
   (state) => state.defaultValueFilterBooking
);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const { actions } = bookingSlice;

export default bookingSlice;
