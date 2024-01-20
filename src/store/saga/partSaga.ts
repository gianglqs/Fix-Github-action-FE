import { takeEvery, put } from 'redux-saga/effects';
import { partStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import partApi from '@/api/part.api';

function* fetchPart() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterPart } = yield* all({
         defaultValueFilterPart: select(partStore.selectDefaultValueFilterPart),
      });
      const initDataFilter = yield* call(partApi.getInitDataFilter);

      const { data } = yield* call(partApi.getParts, defaultValueFilterPart, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const dataShipment = JSON.parse(String(data)).listPart;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataExchangeRate = JSON.parse(String(data)).listExchangeRate;

      yield put(partStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(partStore.actions.setPartList(dataShipment));
      yield put(partStore.actions.setTotalRow(dataTotalRow));
      yield put(partStore.actions.setExchangeRateList(dataExchangeRate));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(partStore.sagaGetList, fetchPart);
}

export default dashboardSaga;
