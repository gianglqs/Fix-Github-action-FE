import { createAction, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

import type { AlertColor } from '@mui/material';
import type { RootReducerType } from './rootReducer';

export const name = 'common';
export const resetState = createAction(`${name}/'RESET_STATE'}`);

export const initialState = {
   messageState: {
      message: '',
      status: 'success' as AlertColor,
      display: false,
   },
   tableState: {
      pageNo: 1,
      perPage: 100,
      totalItems: 0,
   } as any,
   requestId: {
      booking: undefined,
      shipment: undefined,
      quotationMargin: undefined,
   },
   dataFilter: {
      quotationMargin: { region: 'Asia', currency: 'USD' } as any,
   },
   initDataFilter: {
      quotationMargin: {
         region: [
            {
               value: 'Asia',
            },
            {
               value: 'Pacific',
            },
            {
               value: 'India Sub Continent',
            },
            {
               value: 'China',
            },
         ],
      } as any,
   },
   fileUUID: {
      quotationMargin: {} as any,
   },
   dataOnPage: {
      quotationMargin: { listDataAnalysis: [] } as any,
   },
};

const commonSlice = createSlice({
   name,
   initialState,
   reducers: {
      setErrorMessage(state, action: PayloadAction<string>) {
         state.messageState.message = action.payload;
         state.messageState.status = 'error';
         state.messageState.display = true;
      },
      setSuccessMessage(state, action: PayloadAction<string>) {
         state.messageState.message = action.payload;
         state.messageState.status = 'success';
         state.messageState.display = true;
      },
      setNotificationMessage(state, action: PayloadAction<string>) {
         state.messageState.message = action.payload;
         state.messageState.status = 'info';
         state.messageState.display = true;
      },
      setDisplayMessage(state, action: PayloadAction<boolean>) {
         state.messageState.display = action.payload;
      },
      setTableState(state, { payload }: PayloadAction<Partial<any>>) {
         state.tableState = {
            ...state.tableState,
            ...payload,
         };
      },

      setRequestIdBooking(state, action: PayloadAction<any>) {
         state.requestId.booking = action.payload;
      },
      setRequestIdShipment(state, action: PayloadAction<any>) {
         state.requestId.booking = action.payload;
      },
      setRequestIdQuotationMargin(state, action: PayloadAction<any>) {
         state.requestId.quotationMargin = action.payload;
      },

      setDataFilterQuotationMargin(state, action: PayloadAction<any>) {
         state.dataFilter.quotationMargin = action.payload;
      },

      setInitDataFilterQuotationMargin(state, action: PayloadAction<any>) {
         state.initDataFilter.quotationMargin = action.payload;
      },

      setFileUUIDQuotationMargin(state, action: PayloadAction<any>) {
         state.fileUUID.quotationMargin = action.payload;
      },

      setDataOnPageQuotationMargin(state, action: PayloadAction<any>) {
         state.dataOnPage.quotationMargin = action.payload;
      },
   },
   extraReducers: {
      [resetState.type]() {
         return initialState;
      },
   },
});

// Selectors
export const selectState = (state: RootReducerType) => state[name];

export const selectMessageState = createSelector(selectState, (state) => state.messageState);
export const selectTableState = createSelector(selectState, (state) => state.tableState);
export const selectRequestIdBooking = createSelector(
   selectState,
   (state) => state.requestId.booking
);
export const selectRequestIdShipment = createSelector(
   selectState,
   (state) => state.requestId.shipment
);
export const selectRequestIdQuotationMargin = createSelector(
   selectState,
   (state) => state.requestId.quotationMargin
);

export const selectDataFilterQuotationMargin = createSelector(
   selectState,
   (state) => state.dataFilter.quotationMargin
);

export const selectInitDataFilterQuotationMargin = createSelector(
   selectState,
   (state) => state.initDataFilter.quotationMargin
);

export const selectFileUUIDQuotationMargin = createSelector(
   selectState,
   (state) => state.fileUUID.quotationMargin
);

export const selectDataOnPageQuotationMargin = createSelector(
   selectState,
   (state) => state.dataOnPage.quotationMargin
);

export const { actions } = commonSlice;

export default commonSlice;
