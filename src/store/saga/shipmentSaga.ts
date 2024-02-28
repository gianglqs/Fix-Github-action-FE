import { takeEvery, put } from 'redux-saga/effects';
import { shipmentStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import shipmentApi from '@/api/shipment.api';
import { parseCookies } from 'nookies';

function* fetchShipment() {
   try {
      const initDataFilter = yield* call(shipmentApi.getInitDataFilter);
      const { defaultValueFilterOrder } = yield* all({
         defaultValueFilterOrder: select(shipmentStore.selectDefaultValueFilterOrder),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['shipmentFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(shipmentStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterOrder;
      }
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { data } = yield* call(shipmentApi.getShipments, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const dataShipment = JSON.parse(String(data)).listShipment;
      const dataTotalRow = JSON.parse(String(data)).total;
      const dataExchangeRate = JSON.parse(String(data)).listExchangeRate;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(shipmentStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(shipmentStore.actions.setShipmentList(dataShipment));
      yield put(shipmentStore.actions.setTotalRow(dataTotalRow));
      yield put(shipmentStore.actions.setExchangeRateList(dataExchangeRate));
      yield put(shipmentStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(shipmentStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));

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
