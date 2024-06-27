import { takeEvery, put } from 'redux-saga/effects';
import { shipmentStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import shipmentApi from '@/api/shipment.api';
import { parseCookies } from 'nookies';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { isValidDate } from '@/utils/formatDateInput';

function* getDataShipment() {
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

      const currency = yield* select(shipmentStore.selectCurrency);

      const fromDateFilter = dataFilter.fromDate;
      const toDateFilter = dataFilter.toDate;

      if (!isValidDate(fromDateFilter)) {
         throw new Error('From date is invalid!');
      }
      if (!isValidDate(toDateFilter)) {
         throw new Error('To date is invalid!');
      }
      yield put(shipmentStore.actions.setLoadingData(true));

      const { data } = yield* call(shipmentApi.getShipments, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
         currency,
      });

      const dataShipment = JSON.parse(String(data)).data.listOrder;
      const dataTotalRow = JSON.parse(String(data)).data.total;
      const dataServerTimeZone = JSON.parse(String(data)).data.serverTimeZone;
      const dataLastUpdatedTime = JSON.parse(String(data)).data.lastUpdatedTime;
      const dataLastUpdatedBy = JSON.parse(String(data)).data.lastUpdatedBy;

      yield put(
         shipmentStore.actions.setLastUpdatedTime(
            convertServerTimeToClientTimeZone(dataLastUpdatedTime, dataServerTimeZone)
         )
      );

      yield put(shipmentStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(shipmentStore.actions.setShipmentList(dataShipment));
      yield put(shipmentStore.actions.setTotalRow(dataTotalRow));
      yield put(shipmentStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(shipmentStore.actions.setLastUpdatedBy(dataLastUpdatedBy));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).data.totalItems,
         })
      );
      yield put(shipmentStore.actions.setLoadingData(false));
   } catch (error) {
      yield put(shipmentStore.actions.setLoadingData(false));
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* fetchShipment() {
   yield takeEvery(shipmentStore.sagaGetList, getDataShipment);
}

function* switchCurrency() {
   try {
      let { currency } = yield* all({
         currency: select(shipmentStore.selectCurrency),
      });
      currency = currency === 'USD' ? 'AUD' : 'USD';
      yield put(shipmentStore.actions.setCurrency(currency));
      yield* getDataShipment();
   } catch (error) {
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* switchCurrencyShipment() {
   yield takeEvery(shipmentStore.actionSwitchCurrency, switchCurrency);
}

export { fetchShipment, switchCurrencyShipment };
