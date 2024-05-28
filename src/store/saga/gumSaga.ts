import { takeEvery, put } from 'redux-saga/effects';
import { gumStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import historicalImportApi from '@/api/historicalImport.api';
import gumApi from '@/api/gum.api';
function* fetchGum() {
   console.log("fetchGum");
   try {
      console.log('fetch gum!!!!')
      const {dataFilter} = yield* all({
        dataFilter: select(gumStore.selectDataFilter) });
      console.log(dataFilter);
    const { data } = yield* call(gumApi.getGumStats, dataFilter);
  yield put(gumStore.actions.setStatsData(data));
   } catch (error) {}
}

function* dashboardSaga() {
   console.log('aaaaa')
   yield takeEvery(gumStore.sagaGetList, fetchGum);
}

export default dashboardSaga;
