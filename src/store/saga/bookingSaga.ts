import { selectExampleUploadFile } from './../reducers/booking.reducer';
import bookingApi from '@/api/booking.api';
import { isBefore, isValidDate } from '@/utils/formatDateInput';
import { parseCookies } from 'nookies';
import { put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { bookingStore, commonStore } from '../reducers';

function* getDataBooking() {
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

      const currency = yield* select(bookingStore.selectCurrency);

      const fromDateFilter = dataFilter.fromDate;
      const toDateFilter = dataFilter.toDate;

      if (!isValidDate(fromDateFilter)) {
         throw new Error('From date is invalid!');
      }
      if (!isValidDate(toDateFilter)) {
         throw new Error('To date is invalid!');
      }

      if (
         isValidDate(fromDateFilter) &&
         isValidDate(toDateFilter) &&
         isBefore(toDateFilter, fromDateFilter)
      )
         throw new Error('The To Date value cannot be earlier than the From Date value');

      yield put(bookingStore.actions.setLoadingData(true));
      const res = yield* call(bookingApi.getListData, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
         currency,
      });

      const initDataFilter = yield* call(bookingApi.getInitDataFilter);

      const data = JSON.parse(String(res.data));

      const dataBooking = data.data.listOrder;
      const dataTotalRow = data.data.total;
      const dataServerTimeZone = data.data.serverTimeZone;
      const dataLastUpdatedAt = data.data.lastUpdatedTime;
      const dataLastUpdatedBy = data.data.lastUpdatedBy;
      const totalItems = data.data.totalItems;
      const exampleUploadFile = data.data.exampleUploadFile;

      yield put(bookingStore.actions.setDataFilter(dataFilter));
      yield put(bookingStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(bookingStore.actions.setBookingList(dataBooking));
      yield put(bookingStore.actions.setTotalRow(dataTotalRow));
      yield put(bookingStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(bookingStore.actions.setLastUpdatedTime(dataLastUpdatedAt));
      yield put(bookingStore.actions.setLastUpdatedBy(dataLastUpdatedBy));

      yield put(commonStore.actions.setTableState({ totalItems }));
      yield put(bookingStore.actions.setExampleUploadFile(exampleUploadFile));

      yield put(bookingStore.actions.setLoadingData(false));
   } catch (error) {
      yield put(bookingStore.actions.setLoadingData(false));
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* switchCurrency() {
   try {
      let { currency } = yield* all({
         currency: select(bookingStore.selectCurrency),
      });
      currency = currency === 'USD' ? 'AUD' : 'USD';
      yield put(bookingStore.actions.setCurrency(currency));
      yield* getDataBooking();
   } catch (error) {
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* switchCurrencyBooking() {
   yield takeEvery(bookingStore.actionSwitchCurrency, switchCurrency);
}

function* fetchBooking() {
   yield takeEvery(bookingStore.sagaGetList, getDataBooking);
}

export { fetchBooking, switchCurrencyBooking };
