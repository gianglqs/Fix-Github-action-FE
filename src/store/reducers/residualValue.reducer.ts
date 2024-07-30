import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultValueFilterResidualValue } from './../../utils/defaultValues';

import { ResidualValueDataFilter } from '@/types/defaultValue';
import type { RootReducerType } from './rootReducer';

export const name = 'residualValue';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   initDataFilterModelTypeAndBrand: {} as any,
   initDataFilterModelCode: [] as any[],
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
   dataFilter: defaultValueFilterResidualValue as ResidualValueDataFilter,
   listResidualValue: [] as any[],
   exampleUploadFile: {} as any,
   isLoadingPage: false as boolean,
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
      setLastUpdatedTime(state, { payload }: PayloadAction<any[]>) {
         state.lastUpdatedTime = payload;
      },
      setLastUpdatedBy(state, { payload }: PayloadAction<any[]>) {
         state.lastUpdatedBy = payload;
      },

      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.dataFilter = payload;
         localStorage.setItem('residualValueFilter', JSON.stringify(payload));
      },

      setListResidualValue(state, { payload }: PayloadAction<any[]>) {
         state.listResidualValue = payload;
      },
      setExampleUploadFile(state, { payload }: PayloadAction<any>) {
         state.exampleUploadFile = payload;
      },
      resetListResidualValue(state) {
         state.listResidualValue = [];
      },
      showLoadingPage(state) {
         state.isLoadingPage = true;
      },
      hideLoadingPage(state) {
         state.isLoadingPage = false;
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
export const uploadResidualValueFile = createAction<File>(`${name}/uploadResidualValueFile`);

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

export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const selectListResidualValue = createSelector(
   selectState,
   (state) => state.listResidualValue
);

export const selectExampleUploadFile = createSelector(
   selectState,
   (state) => state.exampleUploadFile
);

export const selectLoadingPage = createSelector(selectState, (state) => state.isLoadingPage);

export const { actions } = residualvalueSlice;

export default residualvalueSlice;
