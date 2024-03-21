import { takeEvery, put } from 'redux-saga/effects';
import { bookingMarginTrialTestStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import bookingMarginTrialTestApi from '@/api/bookingMarginTrialTest.api';
import { parseCookies } from 'nookies';

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

      const { data } = yield* call(
         bookingMarginTrialTestApi.getBookingMarginTrialTest,
         dataFilter,
         {
            pageNo: tableState.pageNo,
            perPage: tableState.perPage,
         }
      );

      const dataOrder = JSON.parse(String(data)).listOrder;
      //const dataTotalRow = JSON.parse(String(data)).total;
      // const dataExchangeRate = JSON.parse(String(data)).listExchangeRate;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(
         bookingMarginTrialTestStore.actions.setInitDataFilter(
            JSON.parse(String(initDataFilter.data))
         )
      );

      yield put(bookingMarginTrialTestStore.actions.setOrderList(dataOrder));
      // yield put(bookingMarginTrialTestStore.actions.setTotalRow(dataTotalRow));
      // yield put(bookingMarginTrialTestStore.actions.setExchangeRateList(dataExchangeRate));
      yield put(bookingMarginTrialTestStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(bookingMarginTrialTestStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(bookingMarginTrialTestStore.sagaGetList, fetchBookingTrialTest);
}

export default dashboardSaga;
