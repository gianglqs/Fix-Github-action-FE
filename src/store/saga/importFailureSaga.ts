import { takeEvery, put } from 'redux-saga/effects';
import { importFailureStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import importFailureApi from '@/api/importFailure.api';

function* fetchImportFailure() {
   try {
      const { dataFilter } = yield* all({
         dataFilter: select(importFailureStore.selectDataFilter),
      });

      const { tableState } = yield* all({
         tableState: select(importFailureStore.selectTableState),
      });

      const { importFailureDialogState } = yield* all({
         importFailureDialogState: select(importFailureStore.selectImportFailureDialogState),
      });

      if (dataFilter.fileUUID) {
         const { data } = yield* call(importFailureApi.getImportFailureList, dataFilter, {
            pageNo: tableState.pageNo,
            perPage: tableState.perPage,
         });

         const dataImportFailure = JSON.parse(String(data)).listImportFailure;
         const overview = JSON.parse(String(data)).overview;

         yield put(importFailureStore.actions.setImportFailureList(dataImportFailure));

         yield put(
            importFailureStore.actions.setTableState({
               totalItems: JSON.parse(String(data)).totalItems,
            })
         );

         yield put(
            importFailureStore.actions.setImportFailureDialogState({
               ...importFailureDialogState,
               overview: overview,
            })
         );
      }
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(importFailureStore.sagaGetList, fetchImportFailure);
}

export default dashboardSaga;
