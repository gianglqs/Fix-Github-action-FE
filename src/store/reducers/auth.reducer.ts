import { createSlice, PayloadAction, createSelector, createAction } from '@reduxjs/toolkit';

import type { RootReducerType } from './rootReducer';

export const name = 'auth';
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
   userInfo: {} as any,
   serverTimeZone: '' as any,
   lastUpdatedTime: '' as any,
   lastUpdatedBy: '' as any,
};

const authSlice = createSlice({
   name,
   initialState,
   reducers: {
      setUserInfo(state, { payload }: PayloadAction<any>) {
         state.userInfo = payload;
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
   },
   extraReducers: {
      [resetState.type]() {
         return initialState;
      },
   },
});
// Selectors
export const selectState = (state: RootReducerType) => state[name];
export const selectUserInfo = createSelector(selectState, (state) => state.userInfo);
export const selectServerTimeZone = createSelector(selectState, (state) => state.serverTimeZone);
export const selectLastUpdatedTime = createSelector(selectState, (state) => state.lastUpdatedTime);

export const selectLastUpdatedBy = createSelector(selectState, (state) => state.lastUpdatedBy);

export const { actions } = authSlice;

export default authSlice;
