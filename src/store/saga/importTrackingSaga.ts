import { takeEvery, put } from 'redux-saga/effects';
import { importTrackingStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import importTrackingApi from '@/api/importTracking.api';

function* fetchDataImportTracking() {
   const dataFilter = yield* all({
      dataFilter: select(importTrackingStore.selectDataFilter),
   });

   const { data } = yield* call(
      importTrackingApi.getListDataImportTracking,
      dataFilter.dataFilter.date
   );

   yield put(
      importTrackingStore.actions.setListImportTracking(JSON.parse(data).listImportTracking)
   );
   yield put(importTrackingStore.actions.setServerTimeZone(JSON.parse(data).serverTimeZone));
}

function* fetchImportTracking() {
   yield takeEvery(importTrackingStore.sagaGetList, fetchDataImportTracking);
}

export { fetchImportTracking };
