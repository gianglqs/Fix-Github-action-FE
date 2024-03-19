import { takeEvery, put } from 'redux-saga/effects';
import { volumeDiscountStore } from '../reducers';
import { all, call, select } from 'typed-redux-saga';

import volumeDiscountApi from '@/api/volume-discount.api';
import { parseCookies } from 'nookies';

function* fetchVolumeDiscount() {
   try {
      const initDataFilter = yield* call(volumeDiscountApi.getSegmentFilters);
      yield put(
         volumeDiscountStore.actions.selectInitDataFilter(JSON.parse(String(initDataFilter.data)))
      );

      const { defaultValueFilterVolumeDiscount } = yield* all({
         defaultValueFilterVolumeDiscount: select(
            volumeDiscountStore.selectDefaultValueFilterVolumeDiscount
         ),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['volumeDiscountFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(volumeDiscountStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterVolumeDiscount;
      }

      yield put(volumeDiscountStore.actions.setDataFilter(dataFilter));
   } catch (error) {}
}

function* volumeDiscountSaga() {
   yield takeEvery(volumeDiscountStore.sagaGetList, fetchVolumeDiscount);
}

export default volumeDiscountSaga;
