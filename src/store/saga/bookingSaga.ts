import { takeEvery, put } from 'redux-saga/effects';
import { bookingStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import bookingApi from '@/api/booking.api';

function* fetchBooking() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterBooking } = yield* all({
         defaultValueFilterBooking: select(bookingStore.selectDefaultValueFilterBooking),
      });

      const { data } = yield* call(bookingApi.getListData, defaultValueFilterBooking, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const initDataFilter = yield* call(bookingApi.getInitDataFilter);

      const dataBooking = JSON.parse(String(data)).listBookingOrder;

      yield put(bookingStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(bookingStore.actions.setBookingList(dataBooking));

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
