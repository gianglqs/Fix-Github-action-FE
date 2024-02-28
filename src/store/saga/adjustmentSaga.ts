import { takeEvery, put } from 'redux-saga/effects';
import { adjustmentStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import adjustmentApi from '@/api/adjustment.api';
import { parseCookies } from 'nookies';

function* fetchAdjustment() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterAdjustment } = yield* all({
         defaultValueFilterAdjustment: select(adjustmentStore.selectDefaultValueFilterAdjustment),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['adjustmentFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(adjustmentStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterAdjustment;
      }

      const { defaultValueCalculator } = yield* all({
         defaultValueCalculator: select(adjustmentStore.selectDefaultValueCalculator),
      });

      const jsonDataCalculator = cookies['adjustmentCalculator'];
      let dataCalculator;
      if (jsonDataCalculator) {
         dataCalculator = JSON.parse(String(jsonDataCalculator));
         yield put(adjustmentStore.actions.setDataAdjustment(dataCalculator));
      } else {
         dataCalculator = defaultValueCalculator;
      }

      const { data } = yield* call(
         adjustmentApi.getAdjustment,
         { dataFilter: dataFilter, dataCalculate: dataCalculator },
         {
            pageNo: tableState.pageNo,
            perPage: tableState.perPage,
         }
      );

      const initDataFilter = yield* call(adjustmentApi.getInitDataFilter);

      const dataAdjustment = JSON.parse(String(data)).listAdjustment;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(adjustmentStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(adjustmentStore.actions.setAdjustmentList(dataAdjustment));
      yield put(adjustmentStore.actions.setTotalRow(dataTotalRow));
      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
      yield put(adjustmentStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(adjustmentStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(adjustmentStore.sagaGetList, fetchAdjustment);
}

export default dashboardSaga;
