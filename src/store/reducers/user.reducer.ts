import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'user';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   userList: [] as any[],
   totalRow: [] as any[],
};

const userSlice = createSlice({
   name,
   initialState,
   reducers: {
      setUserList(state, { payload }: PayloadAction<any[]>) {
         state.userList = payload;
      },
      setTotalRow(state, { payload }: PayloadAction<any[]>) {
         state.totalRow = payload;
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
export const selectUserList = createSelector(selectState, (state) => state.userList);
export const selectTotalRow = createSelector(selectState, (state) => state.totalRow);

export const { actions } = userSlice;

export default userSlice;
