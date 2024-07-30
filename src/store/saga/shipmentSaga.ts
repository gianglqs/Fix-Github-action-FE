import shipmentApi from '@/api/shipment.api';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { isBefore, isValidDate } from '@/utils/formatDateInput';
import { PayloadAction } from '@reduxjs/toolkit';
import { parseCookies } from 'nookies';
import { put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { commonStore, shipmentStore } from '../reducers';

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
      if (
         isValidDate(fromDateFilter) &&
         isValidDate(toDateFilter) &&
         isBefore(toDateFilter, fromDateFilter)
      )
         throw new Error('The To Date value cannot be earlier than the From Date value');

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
      const exampleUploadFile = JSON.parse(String(data)).data.exampleUploadFile;

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
      yield put(shipmentStore.actions.setExampleUploadFile(exampleUploadFile));

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

function* handleUploadShipmentFile(action: PayloadAction<File>) {
   try {
      yield put(shipmentStore.actions.showLoadingPage());
      let formData = new FormData();
      const file = action.payload;
      formData.append('file', file);

      const { data } = yield* call(shipmentApi.importDataShipment, formData);

      yield put(commonStore.actions.setSuccessMessage(data.message));
      yield put(shipmentStore.actions.hideLoadingPage());
   } catch (error) {
      yield put(shipmentStore.actions.hideLoadingPage());
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

function* handleUploadShipmentFileSaga() {
   yield takeEvery(shipmentStore.uploadShipmentFile, handleUploadShipmentFile);
}

function* switchCurrencyShipment() {
   yield takeEvery(shipmentStore.actionSwitchCurrency, switchCurrency);
}

export { fetchShipment, handleUploadShipmentFileSaga, switchCurrencyShipment };
