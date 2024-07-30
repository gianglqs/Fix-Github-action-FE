import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { defaultValueSelectedFilterExchangeRate } from '@/utils/defaultValues';
import type { RootReducerType } from './rootReducer';
export const name = 'exchangeRate';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState: {
   dataFilter: Record<string, any>;
   currencyFilter: any;
   chartData: any;
   exchangeRateSource: string;
   isLoadingPage: boolean;
} = {
   dataFilter: defaultValueSelectedFilterExchangeRate,
   currencyFilter: [{ value: '' }],
   chartData: [],
   exchangeRateSource: 'Database',
   isLoadingPage: false,
};

const exchangeRateSlice = createSlice({
   name,
   initialState,
   reducers: {
      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.dataFilter = payload;
      },
      setCurrencyFilter(state, { payload }: PayloadAction<any>) {
         state.currencyFilter = payload;
      },
      setChartData(state, { payload }: PayloadAction<any>) {
         state.chartData = payload;
      },
      setExchangeRateSource(state, { payload }: PayloadAction<any>) {
         state.exchangeRateSource = payload;
      },
      showLoadingPage(state) {
         state.isLoadingPage = true;
      },
      hideLoadingPage(state) {
         state.isLoadingPage = false;
      },
   },
});

export const sagaGetList = createAction(`${name}/GET_LIST`);
export const uploadExchangeRateFile = createAction<File>(`${name}/uploadExchangeRateFile`);
// Selectors
export const selectState = (state: RootReducerType) => state[name];

export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectChartData = createSelector(selectState, (state) => state.chartData);

export const selectCurrencyFilter = createSelector(selectState, (state) => state.currencyFilter);

export const selectExchangeRateSource = createSelector(
   selectState,
   (state) => state.exchangeRateSource
);

export const selectLoadingPage = createSelector(selectState, (state) => state.isLoadingPage);

export const { actions } = exchangeRateSlice;

export default exchangeRateSlice;
