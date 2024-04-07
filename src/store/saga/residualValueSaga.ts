import { takeEvery, put } from 'redux-saga/effects';
import { residualValueStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import { parseCookies } from 'nookies';
import residualValueApi from '@/api/residualValue.api';

function* fetchModelCode() {
   const dataFilter = yield* all({
      dataFilter: select(residualValueStore.selectDataFilter),
   });

   const { data } = yield* call(
      residualValueApi.getInitDataFilterForModelCode,
      dataFilter.dataFilter.modelType,
      dataFilter.dataFilter.brand
   );
   yield put(residualValueStore.actions.setInitDataFilterModelCode(JSON.parse(data)));
}

function* fetchAllInitDataFilter() {
   // default and not change
   const dataModelTypeAndBrand = yield* call(
      residualValueApi.getInitDataFilterForModelTypeAndBrand
   );
   yield put(
      residualValueStore.actions.setInitDataFilterModelTypeAndBrand(
         JSON.parse(dataModelTypeAndBrand.data)
      )
   );

   // fetch data ResidualValue if dataFilter has modelCode
   const cookies = parseCookies();
   const jsonDataFilter = cookies['residualValueFilter'];
   if (jsonDataFilter) {
      const dataFilter = JSON.parse(String(jsonDataFilter));
      console.log('getData from cookies', dataFilter);
      yield put(residualValueStore.actions.setDataFilter(dataFilter));
   }

   const dataFilter = yield* all({
      dataFilter: select(residualValueStore.selectDataFilter),
   });

   const { data } = yield* call(
      residualValueApi.getInitDataFilterForModelCode,
      dataFilter.dataFilter.modelType,
      dataFilter.dataFilter.brand
   );

   const dataModelCodeFilter = JSON.parse(data);

   yield put(residualValueStore.actions.setInitDataFilterModelCode(dataModelCodeFilter));

   if (dataFilter.dataFilter.modelCode) {
      const residualValueData = yield* call(
         residualValueApi.getListResidualValue,
         dataFilter.dataFilter.modelCode
      );
      yield put(
         residualValueStore.actions.setListResidualValue(
            JSON.parse(String(residualValueData.data)).listResidualValue
         )
      );
      yield put(
         residualValueStore.actions.setServerTimeZone(
            JSON.parse(String(residualValueData.data)).serverTimeZone
         )
      );
      yield put(
         residualValueStore.actions.setLatestUpdatedTime(
            JSON.parse(String(residualValueData.data)).latestUpdatedTime
         )
      );
   }
}

function* fetchDataResidualValue() {
   const dataFilter = yield all({
      dataFilter: select(residualValueStore.selectDataFilter),
   });
   if (dataFilter?.dataFilter?.modelCode) {
      const { data } = yield call(
         residualValueApi.getListResidualValue,
         dataFilter.dataFilter.modelCode
      );

      yield put(
         residualValueStore.actions.setListResidualValue(JSON.parse(data).listResidualValue)
      );
      yield put(residualValueStore.actions.setServerTimeZone(JSON.parse(data).serverTimeZone));
      yield put(
         residualValueStore.actions.setLatestUpdatedTime(JSON.parse(data).latestUpdatedTime)
      );
   }
}

function* fetchFirstResidualValue() {
   yield takeEvery(residualValueStore.sagaGetList, fetchAllInitDataFilter);
}

function* fetchModelCodeSaga() {
   yield takeEvery(residualValueStore.reloadModelCode, fetchModelCode);
}

function* fetchDataResidualValueSaga() {
   yield takeEvery(residualValueStore.getDataResidualValue, fetchDataResidualValue);
}

export { fetchFirstResidualValue, fetchModelCodeSaga, fetchDataResidualValueSaga };
