import { takeEvery, put } from 'redux-saga/effects';
import { commonStore, dashboardStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import dashboardApi from '@/api/dashboard.api';

function* fetchUserList() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { data } = yield* call(dashboardApi.getUser, {
         search: '',
         perPage: tableState.perPage,
         pageNo: tableState.pageNo,
      });
      yield put(dashboardStore.actions.setUserList(JSON.parse(data)?.userList));
      yield put(dashboardStore.actions.setTotalRow(JSON.parse(data)?.totalItems));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(data)?.totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(dashboardStore.sagaGetList, fetchUserList);
}

export default dashboardSaga;
