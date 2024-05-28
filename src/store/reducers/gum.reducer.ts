import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'gum';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState :{
    filter: Record<string,any>,
    statsData: any
} = {
   filter :{
   },
   statsData :{}
};

const gumSlice = createSlice({
   name,
   initialState,
   reducers: {
      setDataFilter(state, { payload }: PayloadAction<any>) {
         state.filter = payload;
      },
      setStatsData(state, { payload }: PayloadAction<any>) {
         state.statsData = payload;
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

export const selectDataFilter = createSelector(selectState, (state) => state.filter);

export const selectStatsData = createSelector(selectState, (state) => state.statsData);

export const { actions } = gumSlice;

export default gumSlice;
