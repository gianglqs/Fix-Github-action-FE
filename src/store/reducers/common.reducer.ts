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

export const { actions } = commonSlice;

export default commonSlice;
