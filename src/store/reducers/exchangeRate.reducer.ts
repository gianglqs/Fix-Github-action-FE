import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueSelectedFilterExchangeRate } from '@/utils/defaultValues';
export const name = 'exchangeRate';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState: {
   dataFilter: Record<string, any>;
   currencyFilter: any;
   chartData: any;
   exchangeRateSource: string;
} = {
   dataFilter: defaultValueSelectedFilterExchangeRate,
   currencyFilter: [{ value: '' }],
   chartData: [],
   exchangeRateSource: 'Database',
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
   },
});

export const sagaGetList = createAction(`${name}/GET_LIST`);
// Selectors
export const selectState = (state: RootReducerType) => state[name];

export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectChartData = createSelector(selectState, (state) => state.chartData);

export const selectCurrencyFilter = createSelector(selectState, (state) => state.currencyFilter);

export const selectExchangeRateSource = createSelector(
   selectState,
   (state) => state.exchangeRateSource
);

export const { actions } = exchangeRateSlice;

export default exchangeRateSlice;
