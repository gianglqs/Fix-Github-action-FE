import { defaultValueFilterResidualValue } from './../../utils/defaultValues';
import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { ResidualValueDataFilter } from '@/types/defaultValue';

export const name = 'residualValue';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   initDataFilterModelTypeAndBrand: {} as any,
   initDataFilterModelCode: [] as any[],
   serverTimeZone: '' as any,
   latestUpdatedTime: '' as any,
   dataFilter: defaultValueFilterResidualValue as ResidualValueDataFilter,
   listResidualValue: [] as any[],
};

const residualvalueSlice = createSlice({
   name,
   initialState,
   reducers: {
      setInitDataFilterModelTypeAndBrand(state, { payload }: PayloadAction<any>) {
         state.initDataFilterModelTypeAndBrand = payload;
      },
      setInitDataFilterModelCode(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilterModelCode = payload;
      },
      setServerTimeZone(state, { payload }: PayloadAction<any[]>) {
         state.serverTimeZone = payload;
      },
      setLatestUpdatedTime(state, { payload }: PayloadAction<any[]>) {
         state.latestUpdatedTime = payload;
      },

      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.dataFilter = payload;
      },

      setListResidualValue(state, { payload }: PayloadAction<any[]>) {
         state.listResidualValue = payload;
      },
   },
   extraReducers: {
      [resetState.type]() {
         return initialState;
      },
   },
});

export const sagaGetList = createAction(`${name}/GET_LIST`);
export const reloadModelCode = createAction(`${name}/reloadModelCode`);
export const getDataResidualValue = createAction(`${name}/getDataResidualValue`);

// Selectors
export const selectState = (state: RootReducerType) => state[name];

export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectInitDataFilterModelTypeAndBrand = createSelector(
   selectState,
   (state) => state.initDataFilterModelTypeAndBrand
);

export const selectInitDataFilterModelCode = createSelector(
   selectState,
   (state) => state.initDataFilterModelCode
);

export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);

export const selectLatestUpdatedTime = createSelector(
   selectState,
   (state) => state.latestUpdatedTime
);

export const selectListResidualValue = createSelector(
   selectState,
   (state) => state.listResidualValue
);

export const { actions } = residualvalueSlice;

export default residualvalueSlice;
