import {
  createSlice,
  PayloadAction,
  createSelector,
  createAction,
} from "@reduxjs/toolkit";

import type { RootReducerType } from "./rootReducer";

export const name = "dashboard";
export const resetState = createAction(`${name}/RESET_STATE`);

export const initialState = {
  userList: [] as any[],
};

const dashboardSlice = createSlice({
  name,
  initialState,
  reducers: {
    setUserList(state, { payload }: PayloadAction<any[]>) {
      state.userList = payload;
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
export const selectUserList = createSelector(
  selectState,
  (state) => state.userList
);

export const { actions } = dashboardSlice;

export default dashboardSlice;
