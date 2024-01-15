import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';
import { defaultValueFilterProduct } from '@/utils/defaultValues';

export const name = 'product';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   productList: [] as any[],
   totalRow: [] as any[],
   initDataFilter: {} as any,
   defaultValueFilterProduct: defaultValueFilterProduct as any,
};

const productSlice = createSlice({
   name,
   initialState,
   reducers: {
      setProductList(state, { payload }: PayloadAction<any[]>) {
         state.productList = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
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
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);

export const selectDefaultValueFilterProduct = createSelector(
   selectState,
   (state) => state.defaultValueFilterProduct
);

export const { actions } = productSlice;

export default productSlice;
