import { takeEvery, put } from 'redux-saga/effects';
import { bookingMarginTrialTestStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import bookingMarginTrialTestApi from '@/api/bookingMarginTrialTest.api';
import { parseCookies } from 'nookies';
import { isBefore, isValidDate } from '@/utils/formatDateInput';

function* fetchBookingTrialTest() {
   try {
      const initDataFilter = yield* call(bookingMarginTrialTestApi.getInitDataFilter);
      const { defaultValueFilterOrder } = yield* all({
         defaultValueFilterOrder: select(bookingMarginTrialTestStore.selectDefaultValueFilterOrder),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['bookingMarginTrialTestFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(bookingMarginTrialTestStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterOrder;
      }
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });
      const fromDateFilter = dataFilter.fromDate;
      const toDateFilter = dataFilter.toDate;

      if (!isValidDate(fromDateFilter)) {
         throw new Error('From date is invalid!');
      }
      if (!isValidDate(toDateFilter)) {
         throw new Error('To date is invalid!');
      }

      if (
         !isValidDate(fromDateFilter) &&
         !isValidDate(toDateFilter) &&
         isBefore(toDateFilter, fromDateFilter)
      )
         throw new Error('The To Date value cannot be earlier than the From Date value');

      yield put(bookingMarginTrialTestStore.actions.setLoadingData(true));
      const res = yield* call(bookingMarginTrialTestApi.getBookingMarginTrialTest, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const data = JSON.parse(JSON.stringify(res.data));

      const dataOrder = data.listOrder;
      //const dataTotalRow = JSON.parse(String(data)).total;
      // const dataExchangeRate = JSON.parse(String(data)).listExchangeRate;
      const dataServerTimeZone = data.serverTimeZone;
      const dataLastUpdatedTime = data.lastUpdatedTime;
      const dataLastUpdatedBy = data.lastUpdatedBy;
      const exampleUploadFile = data.exampleUploadFile;

      yield put(
         bookingMarginTrialTestStore.actions.setInitDataFilter(
            JSON.parse(String(initDataFilter.data))
         )
      );

      yield put(bookingMarginTrialTestStore.actions.setOrderList(dataOrder));
      // yield put(bookingMarginTrialTestStore.actions.setTotalRow(dataTotalRow));
      // yield put(bookingMarginTrialTestStore.actions.setExchangeRateList(dataExchangeRate));
      yield put(bookingMarginTrialTestStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(bookingMarginTrialTestStore.actions.setLastUpdatedTime(dataLastUpdatedTime));
      yield put(bookingMarginTrialTestStore.actions.setLastUpdatedBy(dataLastUpdatedBy));

      yield put(
         commonStore.actions.setTableState({
            totalItems: data.totalItems,
         })
      );
      yield put(bookingMarginTrialTestStore.actions.setExampleUploadFile(exampleUploadFile));
      yield put(bookingMarginTrialTestStore.actions.setLoadingData(false));
   } catch (error) {
      yield put(bookingMarginTrialTestStore.actions.setLoadingData(false));
      yield put(commonStore.actions.setErrorMessage(error.message));
      console.log(error);
   }
}

function* dashboardSaga() {
   yield takeEvery(bookingMarginTrialTestStore.sagaGetList, fetchBookingTrialTest);
}

export default dashboardSaga;
