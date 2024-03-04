import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'historicalImport';
export const resetState = createAction(`${name}/RESET_STATE`);

import { defaultValueFilterAdmin } from '@/utils/defaultValues';

export const initialState = {
   listHistoricalImporting: [] as any[],
   dataFilter: defaultValueFilterAdmin as any,
   serverTimeZone: '' as any,
};

const historicalImportSlice = createSlice({
   name,
   initialState,
   reducers: {
      setDataFilter(state, { payload }: PayloadAction<string>) {
         state.dataFilter = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<any[]>) {
         state.serverTimeZone = payload;
      },

      setListHistoricalImporting(state, { payload }: PayloadAction<any[]>) {
         state.listHistoricalImporting = payload;
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
export const selectListHistoricalImporting = createSelector(
   selectState,
   (state) => state.listHistoricalImporting
);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);

export const { actions } = historicalImportSlice;

export default historicalImportSlice;
