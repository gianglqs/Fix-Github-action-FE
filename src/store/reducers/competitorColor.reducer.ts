import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'competitorColors';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   competitorColorList: [] as any[],
   competitorColorSearch: '',
};

const competitorColorSlice = createSlice({
   name,
   initialState,
   reducers: {
      setCompetitorColorList(state, { payload }: PayloadAction<any[]>) {
         state.competitorColorList = payload;
      },

      setCompetitorColorSearch(state, { payload }: PayloadAction<any>) {
         state.competitorColorSearch = payload;
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
export const selectCompetitorColorList = createSelector(
   selectState,
   (state) => state.competitorColorList
);
export const selectCompetitorColorSearch = createSelector(
   selectState,
   (state) => state.competitorColorSearch
);

export const { actions } = competitorColorSlice;
export default competitorColorSlice;
