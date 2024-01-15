import { takeEvery, put } from 'redux-saga/effects';
import { shipmentStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import shipmentApi from '@/api/shipment.api';

function* fetchShipment() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterOrder } = yield* all({
         defaultValueFilterOrder: select(shipmentStore.selectDefaultValueFilterOrder),
      });
      const initDataFilter = yield* call(shipmentApi.getInitDataFilter);

      const { data } = yield* call(shipmentApi.getShipments, defaultValueFilterOrder, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const dataShipment = JSON.parse(String(data)).listShipment;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataExchangeRate = JSON.parse(String(data)).listExchangeRate;

      yield put(shipmentStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(shipmentStore.actions.setShipmentList(dataShipment));
      yield put(shipmentStore.actions.setTotalRow(dataTotalRow));
      yield put(shipmentStore.actions.setExchangeRateList(dataExchangeRate));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(shipmentStore.sagaGetList, fetchShipment);
}

export default dashboardSaga;
