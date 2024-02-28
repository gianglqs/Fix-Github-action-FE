import { takeEvery, put } from 'redux-saga/effects';
import { bookingStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import bookingApi from '@/api/booking.api';
import { parseCookies } from 'nookies';
import { json } from 'node:stream/consumers';

function* fetchBooking() {
   try {
      const { defaultValueFilterOrder } = yield* all({
         defaultValueFilterOrder: select(bookingStore.selectDefaultValueFilterBooking),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['bookingFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(bookingStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterOrder;
      }
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { data } = yield* call(bookingApi.getListData, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const initDataFilter = yield* call(bookingApi.getInitDataFilter);

      const dataBooking = JSON.parse(String(data)).listBookingOrder;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataExchangeRate = JSON.parse(String(data)).listExchangeRate;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(bookingStore.actions.setDataFilter(dataFilter));
      yield put(bookingStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(bookingStore.actions.setBookingList(dataBooking));
      yield put(bookingStore.actions.setTotalRow(dataTotalRow));
      yield put(bookingStore.actions.setExchangeRateList(dataExchangeRate));
      yield put(bookingStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(bookingStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(bookingStore.sagaGetList, fetchBooking);
}

export default dashboardSaga;
