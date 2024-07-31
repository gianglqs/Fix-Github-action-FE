import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'importFailure';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   importFailureList: [] as any[],
   totalRow: [] as any[],

   dataFilter: {
      fileUUID: '' as string,
      search: '' as string,
   } as any,
   serverTimeZone: '' as any,
   latestUpdatedTime: '' as any,
   importFailureDialogState: {
      open: false as boolean,
      overview: '' as string,
   },
   tableState: {
      pageNo: 1,
      perPage: 100,
      totalItems: 0,
   } as any,
};

const importFailureSlice = createSlice({
   name,
   initialState,
   reducers: {
      setImportFailureList(state, { payload }: PayloadAction<any[]>) {
         state.importFailureList = payload;
      },

      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
      },

      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.dataFilter = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<any[]>) {
         state.serverTimeZone = payload;
      },
      setLatestUpdatedTime(state, { payload }: PayloadAction<any[]>) {
         state.latestUpdatedTime = payload;
      },
      setImportFailureDialogState(state, action: PayloadAction<any>) {
         state.importFailureDialogState = action.payload;
      },
      setTableState(state, { payload }: PayloadAction<Partial<any>>) {
         state.tableState = {
            ...state.tableState,
            ...payload,
         };
      },
      setFileUUID(state, { payload }: PayloadAction<string>) {
         state.dataFilter.fileUUID = payload;
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
export const selectImportFailureList = createSelector(
   selectState,
   (state) => state.importFailureList
);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLatestUpdatedTime = createSelector(
   selectState,
   (state) => state.latestUpdatedTime
);
export const selectImportFailureDialogState = createSelector(
   selectState,
   (state) => state.importFailureDialogState
);
export const selectTableState = createSelector(selectState, (state) => state.tableState);
export const { actions } = importFailureSlice;

export default importFailureSlice;
