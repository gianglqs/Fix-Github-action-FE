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
   ExchangeRateList: [] as any[],
};

const bookingSlice = createSlice({
   name,
   initialState,
   reducers: {
      setBookingList(state, { payload }: PayloadAction<any[]>) {
         state.bookingOrdersList = payload;
      },
      setExchangeRateList(state, { payload }: PayloadAction<any[]>) {
         state.ExchangeRateList = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setDefaultValueFilterBooking(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterBooking = {
            ...state.defaultValueFilterBooking,
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
export const selectBookingList = createSelector(selectState, (state) => state.bookingOrdersList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectExchangeRateList = createSelector(
   selectState,
   (state) => state.ExchangeRateList
);

export const selectDefaultValueFilterBooking = createSelector(
   selectState,
   (state) => state.defaultValueFilterBooking
);

export const { actions } = bookingSlice;

export default bookingSlice;
