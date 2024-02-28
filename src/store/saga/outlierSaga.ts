import { takeEvery, put } from 'redux-saga/effects';
import { outlierStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import outlierApi from '@/api/outlier.api';
import { parseCookies } from 'nookies';

function* fetchOutlier() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterOutlier } = yield* all({
         defaultValueFilterOutlier: select(outlierStore.selectDefaultValueFilterOutlier),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['outlierFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(outlierStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterOutlier;
      }

      const initDataFilter = yield* call(outlierApi.getInitDataFilter);

      const { data } = yield* call(outlierApi.getOutlier, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const dataOutlier = JSON.parse(String(data)).listOutlier;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(outlierStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(outlierStore.actions.setOutlierList(dataOutlier));
      yield put(outlierStore.actions.setTotalRow(dataTotalRow));
      yield put(outlierStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(outlierStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(outlierStore.sagaGetList, fetchOutlier);
}

export default dashboardSaga;
