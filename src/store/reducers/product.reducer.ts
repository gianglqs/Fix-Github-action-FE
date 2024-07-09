import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterProduct } from '@/utils/defaultValues';

export const name = 'product';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   productList: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterProduct: defaultValueFilterProduct as any,
   dataFilter: {} as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
   exampleUploadFile: {} as any,
};

const productSlice = createSlice({
   name,
   initialState,
   reducers: {
      setProductList(state, { payload }: PayloadAction<any[]>) {
         state.productList = payload;
      },
      setInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setDefaultValueFilterProduct(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterProduct = {
            ...state.defaultValueFilterProduct,
            ...payload,
         };
      },
      setDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.dataFilter = payload;
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
      setExampleUploadFile(state, { payload }: PayloadAction<any>) {
         state.exampleUploadFile = payload;
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
export const selectProductList = createSelector(selectState, (state) => state.productList);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);

export const selectDefaultValueFilterProduct = createSelector(
   selectState,
   (state) => state.defaultValueFilterProduct
);
export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const selectExampleUploadFile = createSelector(
   selectState,
   (state) => state.exampleUploadFile
);

export const { actions } = productSlice;

export default productSlice;
