import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'margin_analysis';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   marginAnalystData: { listDataAnalysis: [] } as any,
   isLoadingPage: false as boolean,
   initDataFilter: {
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
   fileUUID: undefined,
   dataFilter: { region: 'Asia', currency: 'USD' } as any,
   requestId: undefined,
};

const marginAnalysisSlice = createSlice({
   name,
   initialState,
   reducers: {
      setMarginData(state, { payload }: PayloadAction<any>) {
         state.marginAnalystData = payload;
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

      setFileUUID(state, { payload }: PayloadAction<any>) {
         state.fileUUID = payload;
      },

      setRequestId(state, { payload }: PayloadAction<any>) {
         state.requestId = payload;
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
export const selectMarginData = createSelector(selectState, (state) => state.marginAnalystData);

export const selectIsLoadingPage = createSelector(selectState, (state) => state.isLoadingPage);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectFileUUID = createSelector(selectState, (state) => state.fileUUID);
export const selectRequestId = createSelector(selectState, (state) => state.requestId);

export const { actions } = marginAnalysisSlice;

export default marginAnalysisSlice;
