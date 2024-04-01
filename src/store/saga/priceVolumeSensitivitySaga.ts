import { takeEvery, put } from 'redux-saga/effects';
import { priceVolumeSensitivityStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import priceVolumeSensitivityApi from '@/api/priceVolumeSensitivity.api';
import { parseCookies } from 'nookies';

function* fetchPriceVolumeSensitivity() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      //get data filter
      const { defaultValueFilter } = yield* all({
         defaultValueFilter: select(priceVolumeSensitivityStore.selectDefaultValueFilterOrder),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['priceVolumnSensitivityFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(priceVolumeSensitivityStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilter;
      }

      // get discountPercent
      const discountPercentJSON = cookies['priceVolumnSensitivityDiscountPercent'];
      let discountPercent = 0;
      if (discountPercentJSON) {
         discountPercent = Number(discountPercentJSON);
         yield put(priceVolumeSensitivityStore.actions.setDiscountPercent(discountPercent));
      }

      // get withMarginVolumeRecovery
      const { withMarginVolumeRecovery } = yield* all({
         withMarginVolumeRecovery: select(
            priceVolumeSensitivityStore.selectWithMarginVolumeRecovery
         ),
      });

      const { data } = yield* call(
         priceVolumeSensitivityApi.getPriceVolumeSensitivity,
         { dataFilter: dataFilter, discountPercent, withMarginVolumeRecovery },
         {
            pageNo: tableState.pageNo,
            perPage: tableState.perPage,
         }
      );

      const initDataFilter = yield* call(priceVolumeSensitivityApi.getInitDataFilter);

      const listOrder = JSON.parse(String(data)).listOrder;
      const dataTotalRow = JSON.parse(String(data)).totalItems;
      const dataServerTimeZone = JSON.parse(String(data)).serverTimeZone;
      const dataLatestUpdatedTime = JSON.parse(String(data)).latestUpdatedTime;

      yield put(
         priceVolumeSensitivityStore.actions.setInitDataFilter(
            JSON.parse(String(initDataFilter.data))
         )
      );
      yield put(priceVolumeSensitivityStore.actions.setPriceVolumeSensitivityList(listOrder));
      yield put(priceVolumeSensitivityStore.actions.setTotalRow(dataTotalRow));
      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(data)).totalItems,
         })
      );
      yield put(priceVolumeSensitivityStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(priceVolumeSensitivityStore.actions.setLatestUpdatedTime(dataLatestUpdatedTime));
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(priceVolumeSensitivityStore.sagaGetList, fetchPriceVolumeSensitivity);
}

export default dashboardSaga;
