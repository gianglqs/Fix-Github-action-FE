import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { ImportTrackingDataFilter } from '@/types/defaultValue';
import { defaultValueFilterImportTracking } from '@/utils/defaultValues';

export const name = 'importTracking';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   serverTimeZone: '' as any,
   dataFilter: defaultValueFilterImportTracking as ImportTrackingDataFilter,
   listImportTracking: [] as any[],
};

const importTrackingSlice = createSlice({
   name,
   initialState,
   reducers: {
      setServerTimeZone(state, { payload }: PayloadAction<any[]>) {
         state.serverTimeZone = payload;
      },

      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.dataFilter = payload;
      },

      setListImportTracking(state, { payload }: PayloadAction<any[]>) {
         state.listImportTracking = payload;
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

export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);

export const selectListImportTracking = createSelector(
   selectState,
   (state) => state.listImportTracking
);

export const { actions } = importTrackingSlice;

export default importTrackingSlice;
