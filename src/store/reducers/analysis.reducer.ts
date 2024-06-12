import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultDataFilterQuotationMargin } from '@/utils/defaultValues';

export const name = 'margin_analysis';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   marginAnalystData: { listDataAnalysis: [], marginAnalysisSummary: {} } as any,
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
            value: 'India',
         },
         {
            value: 'China',
         },
      ],
      subRegion: [{ value: 'Australia' }, { value: 'None Australia' }],
      delivery: [{ value: 'DDP' }, { value: 'CIF' }],
   } as any,
   fileUUID: undefined,
   fileName: undefined,
   dataFilter: defaultDataFilterQuotationMargin as any,
   requestId: undefined,
   currency: undefined,
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

      setFileName(state, { payload }: PayloadAction<any>) {
         state.fileName = payload;
      },

      setRequestId(state, { payload }: PayloadAction<any>) {
         state.requestId = payload;
      },

      setCurrency(state, { payload }: PayloadAction<any>) {
         state.currency = payload;
      },

      resetFilter(state) {
         state.dataFilter = defaultDataFilterQuotationMargin;
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
export const selectFileName = createSelector(selectState, (state) => state.fileName);
export const selectRequestId = createSelector(selectState, (state) => state.requestId);
export const selectCurrency = createSelector(selectState, (state) => state.currency);

export const { actions } = marginAnalysisSlice;

export default marginAnalysisSlice;
