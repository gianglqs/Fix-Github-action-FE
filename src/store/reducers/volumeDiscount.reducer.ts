import { PayloadAction, createAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { RootReducerType } from './rootReducer';
import { defaultValueFilterVolumeDiscount } from '@/utils/defaultValues';

export const name = 'volume-discount';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   initDataFilter: {} as any,
   defaultValueFilterVolumeDiscount: defaultValueFilterVolumeDiscount,
   dataFilter: {} as any,
};

const volumeDiscountSlice = createSlice({
   name,
   initialState,
   reducers: {
      selectInitDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.initDataFilter = payload;
      },
      setDataFilter(state, { payload }: PayloadAction<any[]>) {
         state.dataFilter = payload;
      },
      setDefaultValueFilterVolumeDiscount(state, { payload }: PayloadAction<Partial<any>>) {
         state.defaultValueFilterVolumeDiscount = {
            ...state.defaultValueFilterVolumeDiscount,
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

export const selectState = (state: RootReducerType) => state[name];
export const selectInitDataFilter = createSelector(selectState, (state) => state.initDataFilter);
export const selectDataFilter = createSelector(selectState, (state) => state.dataFilter);
export const selectDefaultValueFilterVolumeDiscount = createSelector(
   selectState,
   (state) => state.defaultValueFilterVolumeDiscount
);

export const { actions } = volumeDiscountSlice;
export default volumeDiscountSlice;
