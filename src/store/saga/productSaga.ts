import { takeEvery, put } from 'redux-saga/effects';
import { productStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import productApi from '@/api/product.api';

function* fetchProduct() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterProduct } = yield* all({
         defaultValueFilterProduct: select(productStore.selectDefaultValueFilterProduct),
      });

      const { data } = yield* call(productApi.getListProduct, defaultValueFilterProduct, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });

      console.log('dang o trong product');

      const initDataFilter = yield* call(productApi.getInitDataFilter);

      const dataProduct = JSON.parse(String(data)).listData;

      yield put(productStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(productStore.actions.setProductList(dataProduct));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
   } catch (error) {}
}

function* productSaga() {
   yield takeEvery(productStore.sagaGetList, fetchProduct);
}

export default productSaga;
