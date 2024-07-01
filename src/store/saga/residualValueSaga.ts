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
      dataFilter.dataFilter.modelType || '',
      dataFilter.dataFilter.brand || ''
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
   const dataFilterString = localStorage.getItem('residualValueFilter');
   if (dataFilterString) {
      const dataFilter = JSON.parse(String(dataFilterString));
      yield put(residualValueStore.actions.setDataFilter(dataFilter));
   }

   const dataFilter = yield* all({
      dataFilter: select(residualValueStore.selectDataFilter),
   });

   const { data } = yield* call(
      residualValueApi.getInitDataFilterForModelCode,
      dataFilter.dataFilter.modelType || '',
      dataFilter.dataFilter.brand || ''
   );

   const dataModelCodeFilter = JSON.parse(data);

   yield put(residualValueStore.actions.setInitDataFilterModelCode(dataModelCodeFilter));
   yield* fetchDataResidualValue();
}

function* fetchDataResidualValue() {
   const { dataFilter } = yield all({
      dataFilter: select(residualValueStore.selectDataFilter),
   });

   if (dataFilter?.modelCode && dataFilter?.modelCode !== '') {
      const { data } = yield call(residualValueApi.getListResidualValue, dataFilter.modelCode);

      const modelType = JSON.parse(data).modelType;
      const brand = JSON.parse(data).brand;
      const newDataFilter = { ...dataFilter, modelType, brand };

      yield put(
         residualValueStore.actions.setListResidualValue(JSON.parse(data).listResidualValue)
      );
      yield put(residualValueStore.actions.setServerTimeZone(JSON.parse(data).serverTimeZone));
      yield put(
         residualValueStore.actions.setLastUpdatedTime(JSON.parse(String(data)).lastUpdatedTime)
      );
      yield put(
         residualValueStore.actions.setLastUpdatedBy(JSON.parse(String(data)).lastUpdatedBy)
      );
      yield put(residualValueStore.actions.setDataFilter(newDataFilter));
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
