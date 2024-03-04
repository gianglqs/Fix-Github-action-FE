import { takeEvery, put } from 'redux-saga/effects';
import { historicalImportStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import historicalImportApi from '@/api/historicalImport.api';

function* fetchHistoricalImport() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { dataFilter } = yield* all({
         dataFilter: select(historicalImportStore.selectDataFilter),
      });

      const { data } = yield* call(historicalImportApi.getListHistoricalImport, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const dataListFileUploaded = JSON.parse(String(data)).listFileUploaded;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;

      yield put(historicalImportStore.actions.setListHistoricalImporting(dataListFileUploaded));
      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
      yield put(historicalImportStore.actions.setServerTimeZone(dataServerTimeZone));
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(historicalImportStore.sagaGetList, fetchHistoricalImport);
}

export default dashboardSaga;
