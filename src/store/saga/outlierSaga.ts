import { takeEvery, put } from 'redux-saga/effects';
import { outlierStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import outlierApi from '@/api/outlier.api';
import { parseCookies } from 'nookies';
import { isBefore, isValidDate } from '@/utils/formatDateInput';

function* fetchOutlier() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterOutlier } = yield* all({
         defaultValueFilterOutlier: select(outlierStore.selectDefaultValueFilterOutlier),
      });

      const { isBookingData } = yield* all({
         isBookingData: select(outlierStore.selectDataSource),
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
      const fromDateFilter = dataFilter.fromDate;
      const toDateFilter = dataFilter.toDate;

      if (!isValidDate(fromDateFilter)) {
         throw new Error('From date is invalid!');
      }
      if (!isValidDate(toDateFilter)) {
         throw new Error('To date is invalid!');
      }
      if (
         isValidDate(toDateFilter) &&
         isValidDate(fromDateFilter) &&
         isBefore(toDateFilter, fromDateFilter)
      )
         throw new Error('The To Date value cannot be earlier than the From Date value');

      yield put(outlierStore.actions.setLoadingData(true));

      const initDataFilter = yield* call(outlierApi.getInitDataFilter);

      const { data } = yield* call(outlierApi.getOutlier, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
         isBookingData,
      });

      const dataOutlier = JSON.parse(String(data)).listOutlier;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLastUpdatedTime = JSON.parse(String(data)).lastUpdatedTime;
      const dataLastUpdatedBy = JSON.parse(String(data)).lastUpdatedBy;

      yield put(outlierStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(outlierStore.actions.setOutlierList(dataOutlier));
      yield put(outlierStore.actions.setTotalRow(dataTotalRow));
      yield put(outlierStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(outlierStore.actions.setLastUpdatedTime(dataLastUpdatedTime));
      yield put(outlierStore.actions.setLastUpdatedBy(dataLastUpdatedBy));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
      yield put(outlierStore.actions.setLoadingData(false));
   } catch (error) {
      yield put(outlierStore.actions.setLoadingData(false));
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* dashboardSaga() {
   yield takeEvery(outlierStore.sagaGetList, fetchOutlier);
}

export default dashboardSaga;
