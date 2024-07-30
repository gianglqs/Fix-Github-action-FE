import productApi from '@/api/product.api';
import { PayloadAction } from '@reduxjs/toolkit';
import { parseCookies } from 'nookies';
import { put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { commonStore, productStore } from '../reducers';

function* fetchProduct() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterProduct } = yield* all({
         defaultValueFilterProduct: select(productStore.selectDefaultValueFilterProduct),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['productFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(productStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterProduct;
      }

      const { data } = yield* call(productApi.getListProduct, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      const initDataFilter = yield* call(productApi.getInitDataFilter);

      const dataProduct = JSON.parse(String(data)).listData;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLastUpdatedTime = JSON.parse(String(data)).lastUpdatedTime;
      const dataLastUpdatedBy = JSON.parse(String(data)).lastUpdatedBy;
      const exampleUploadFile = JSON.parse(String(data)).exampleUploadFile;

      yield put(productStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(productStore.actions.setProductList(dataProduct));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
      yield put(productStore.actions.setExampleUploadFile(exampleUploadFile));
      yield put(productStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(productStore.actions.setLastUpdatedTime(dataLastUpdatedTime));
      yield put(productStore.actions.setLastUpdatedBy(dataLastUpdatedBy));
   } catch (error) {}
}

function* handleUploadProductFile(action: PayloadAction<File>) {
   try {
      yield put(productStore.actions.showLoadingPage());
      let formData = new FormData();
      const file = action.payload;
      formData.append('file', file);

      const { data } = yield* call(productApi.importDataProduct, formData);

      yield put(commonStore.actions.setSuccessMessage(data.message));
      yield put(productStore.actions.hideLoadingPage());
   } catch (error) {
      yield put(productStore.actions.hideLoadingPage());
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* fetchProductDataForTableSaga() {
   yield takeEvery(productStore.sagaGetList, fetchProduct);
}

function* handleUploadProductFileSaga() {
   yield takeEvery(productStore.uploadProductFile, handleUploadProductFile);
}

export { fetchProductDataForTableSaga, handleUploadProductFileSaga };
