import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultDataFilterQuotationMargin } from '@/utils/defaultValues';
import {
   OptionFilterFromCalculateFile,
   OptionsFilterQuotationMargin,
} from '@/types/quotationMargin';

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
      type: null,
      orderNumber: null,
      modelCode: null,
      series: null,
   } as OptionsFilterQuotationMargin,
   fileUUID: undefined,
   fileName: undefined,
   dataFilter: defaultDataFilterQuotationMargin as any,
   requestId: undefined,
   currency: undefined,
   exampleUploadFile: {} as any,
};

const marginAnalysisSlice = createSlice({
   name,
   initialState,
   reducers: {
      setMarginData(state, { payload }: PayloadAction<any>) {
         state.marginAnalystData = payload;
      },

      showLoadingPage(state) {
         state.isLoadingPage = true;
      },
      hideLoadingPage(state) {
         state.isLoadingPage = false;
      },

      setInitDataFilter(state, { payload }: PayloadAction<OptionsFilterQuotationMargin>) {
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
      setExampleUploadFile(state, { payload }: PayloadAction<any>) {
         state.exampleUploadFile = payload;
      },

      // setData for options filter
      updateOptionFilterFromCalculateFile(
         state,
         { payload }: PayloadAction<OptionFilterFromCalculateFile>
      ) {
         state.initDataFilter.modelCode = payload.modelCode;
         state.initDataFilter.series = payload.series;
         state.initDataFilter.orderNumber = payload.orderNumber;
         state.initDataFilter.type = payload.type;
      },
   },
   extraReducers: {
      [resetState.type]() {
         return initialState;
      },
   },
});

export const sagaGetList = createAction(`${name}/GET_LIST`);
export const openCalculatorFile = createAction(`${name}/handleOpenCulculateFile`);
export const calculateMargin = createAction(`${name}/handleCalculateMargin`);
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
export const selectExampleUploadFile = createSelector(
   selectState,
   (state) => state.exampleUploadFile
);
export const { actions } = marginAnalysisSlice;

export default marginAnalysisSlice;
