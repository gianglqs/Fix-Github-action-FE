import { takeEvery, put } from 'redux-saga/effects';
import { gumStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import gumApi from '@/api/gum.api';
function* fetchGum() {
   try {
      const {dataFilter} = yield* all({
        dataFilter: select(gumStore.selectDataFilter) });
    const { data } = yield* call(gumApi.getGumStats, dataFilter);
  yield put(gumStore.actions.setStatsData(data));
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(gumStore.sagaGetList, fetchGum);
}

export default dashboardSaga;
