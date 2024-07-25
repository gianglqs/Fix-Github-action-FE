import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterOrder } from '@/utils/defaultValues';

export const name = 'imageDialog';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   imageURL: undefined as string,
   open: false as boolean,
};

const bookingSlice = createSlice({
   name,
   initialState,
   reducers: {
      setImageURL(state, { payload }: PayloadAction<string>) {
         state.imageURL = payload;
      },
      closeDialog(state) {
         state.open = false;
      },
      openDialog(state) {
         state.open = true;
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
export const selectImageURL = createSelector(selectState, (state) => state.imageURL);
export const selectDialogState = createSelector(selectState, (state) => state.open);

export const { actions } = bookingSlice;

export default bookingSlice;
