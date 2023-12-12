import { takeEvery, put } from 'redux-saga/effects';
import { outlierStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import outlierApi from '@/api/outlier.api';

function* fetchOutlier() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterOutlier } = yield* all({
         defaultValueFilterOutlier: select(outlierStore.selectDefaultValueFilterOutlier),
      });
      const initDataFilter = yield* call(outlierApi.getInitDataFilter);
      console.log(initDataFilter);

      const { data } = yield* call(outlierApi.getOutlier, defaultValueFilterOutlier, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const dataOutlier = JSON.parse(String(data)).listOutlier;
      const dataTotalRow = JSON.parse(String(data)).total;

      yield put(outlierStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(outlierStore.actions.setOutlierList(dataOutlier));
      yield put(outlierStore.actions.setTotalRow(dataTotalRow));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   console.log('a');

   yield takeEvery(outlierStore.sagaGetList, fetchOutlier);
}

export default dashboardSaga;
