import indicatorApi from '@/api/indicators.api';
import { parseCookies } from 'nookies';
import { put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { commonStore, manageCompetitorStore } from '../reducers';

function* fetchmanageCompetitorStore() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterIndicator } = yield* all({
         defaultValueFilterIndicator: select(
            manageCompetitorStore.selectDefaultValueFilterIndicator
         ),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['manageCompetitorStoreTableFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(manageCompetitorStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterIndicator;
      }

      // get data for filter
      const initDataFilter = yield* call(indicatorApi.getInitDataFilter);
      yield put(manageCompetitorStore.actions.setInitDataFilter(JSON.parse(initDataFilter.data)));

      // get data for table
      const dataListIndicator = yield* call(indicatorApi.getIndicators, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });
      const dataListIndicatorObject = JSON.parse(String(dataListIndicator.data)).listCompetitor;
      yield put(manageCompetitorStore.actions.setIndicatorList(dataListIndicatorObject));

      const dataTotalRow = JSON.parse(String(dataListIndicator.data)).total;
      yield put(manageCompetitorStore.actions.setTotalRow(dataTotalRow));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(dataListIndicator.data)).totalItems,
         })
      );

      const dataServerTimeZone = JSON.parse(String(dataListIndicator.data)).serverTimeZone;
      const dataLastUpdatedTime = JSON.parse(String(dataListIndicator.data)).lastUpdatedTime;
      const dataLastUpdatedBy = JSON.parse(String(dataListIndicator.data)).lastUpdatedBy;

      yield put(manageCompetitorStore.actions.setServerTimeZone(dataServerTimeZone));
      yield put(manageCompetitorStore.actions.setLastUpdatedTime(dataLastUpdatedTime));
      yield put(manageCompetitorStore.actions.setLastUpdatedBy(dataLastUpdatedBy));
   } catch (error) {}
}

function* fetchCompetitorSaga() {
   yield takeEvery(manageCompetitorStore.sagaGetList, fetchmanageCompetitorStore);
}

export default fetchCompetitorSaga;
