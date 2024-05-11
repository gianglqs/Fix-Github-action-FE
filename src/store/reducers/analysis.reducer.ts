import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'margin_analysis';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   marginAnalystData: [] as any[],
   dealerList: [] as any[],
   isLoadingPage: false as boolean,
   initDataFilter: {} as any,
   fileUUID: undefined,
   dataFilter: {} as any,
   marginData: {} as any,
};

const marginAnalysisSlice = createSlice({
   name,
   initialState,
   reducers: {
      setMarginAnalystData(state, { payload }: PayloadAction<any[]>) {
         state.marginAnalystData = payload;
      },
      setDealerList(state, { payload }: PayloadAction<any[]>) {
         state.dealerList = payload;
      },

      setLoadingPage(state, { payload }: PayloadAction<any>) {
         state.isLoadingPage = payload;
      },

      setInitDataFilter(state, { payload }: PayloadAction<any>) {
         state.initDataFilter = payload;
      },
      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.dataFilter = payload;
      },
      setMarginData(state, { payload }: PayloadAction<any>) {
         state.marginData = payload;
      },
      setFileUUID(state, { payload }: PayloadAction<any>) {
         state.fileUUID = payload;
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
export const selectMarginAnalystData = createSelector(
   selectState,
   (state) => state.marginAnalystData
);

export const selectIsLoadingPage = createSelector(selectState, (state) => state.isLoadingPage);

export const selectDealerList = createSelector(selectState, (state) => state.dealerList);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectFileUUID = createSelector(selectState, (state) => state.fileUUID);
export const selectMarginData = createSelector(selectState, (state) => state.marginData);

export const { actions } = marginAnalysisSlice;

export default marginAnalysisSlice;
