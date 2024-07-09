import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
export const name = 'longTermRental';
export const resetState = createAction(`${name}/RESET_STATE`);
//types
import { FilterOptions } from '@/types';
import { InitReducer } from '@/types';
//others
type LongTermRentalInitState = {
   // data to fill select options
   filterOptions: FilterOptions;
   // user's selected data of chart
   selectedFilterOptions: {
      series: string;
      modelCode: string;
   };
   generalInputValues: any;
   isAbleToCalculate: boolean;
   servicePerHour: number;
   residualPercentage: number;
} & InitReducer;

export const initialState: LongTermRentalInitState = {
   filterOptions: {},
   selectedFilterOptions: {
      series: null,
      modelCode: null,
   },
   isAbleToCalculate: false,
   servicePerHour: 0,
   residualPercentage: 0,
   generalInputValues: {},
   serverTimeZone: '',
   lastUpdatedTime: '',
   lastUpdatedBy: '',
   loadingPage: true,
};

const longTermRentalSlice = createSlice({
   name,
   initialState,
   reducers: {
      setFilterOptions(state, { payload }: PayloadAction<FilterOptions>) {
         state.filterOptions = payload;
      },
      setSelectedFilters(state, { payload }: PayloadAction<any>) {
         state.selectedFilterOptions = payload;
      },
      setGeneralInputsValues(state, { payload }: PayloadAction<any>) {
         state.generalInputValues = payload;
      },
      setServicePerHours(state, { payload }: PayloadAction<number>) {
         state.servicePerHour = payload;
      },
      setresidualPercentage(state, { payload }: PayloadAction<number>) {
         state.residualPercentage = payload;
      },
      setIsAbleToCalculate(state, { payload }: PayloadAction<boolean>) {
         state.isAbleToCalculate = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<string>) {
         state.serverTimeZone = payload;
      },
      setLastUpdatedTime(state, { payload }: PayloadAction<string>) {
         state.lastUpdatedTime = payload;
      },
      setLastUpdatedBy(state, { payload }: PayloadAction<string>) {
         state.lastUpdatedBy = payload;
      },
      setLoadingPage(state, { payload }: PayloadAction<boolean>) {
         state.loadingPage = payload;
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

export const selectFilterOptions = createSelector(selectState, (state) => state.filterOptions);

export const selectSelectedFilters = createSelector(
   selectState,
   (state) => state.selectedFilterOptions
);

export const selectResidualPercentage = createSelector(
   selectState,
   (state) => state.residualPercentage
);

export const selectGeneralInputValues = createSelector(
   selectState,
   (state) => state.generalInputValues
);
export const selectServicePerHour = createSelector(selectState, (state) => state.servicePerHour);

export const selectIsAbleToCalculate = createSelector(
   selectState,
   (state) => state.isAbleToCalculate
);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);

export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const selectLoadingPage = createSelector(selectState, (state) => state.loadingPage);

export const { actions } = longTermRentalSlice;

export default longTermRentalSlice;
