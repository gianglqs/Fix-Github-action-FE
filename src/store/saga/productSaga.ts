import { takeEvery, put } from 'redux-saga/effects';
import { productStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import productApi from '@/api/product.api';
import { parseCookies } from 'nookies';

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
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(productStore.actions.setInitDataFilter(JSON.parse(String(initDataFilter.data))));
      yield put(productStore.actions.setProductList(dataProduct));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
      yield put(productStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(productStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));
   } catch (error) {}
}

function* productSaga() {
   yield takeEvery(productStore.sagaGetList, fetchProduct);
}

export default productSaga;
