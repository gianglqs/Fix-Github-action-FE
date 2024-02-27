import { selectDataFilterBubbleChart } from './../reducers/indicator.reducer';
import { takeEvery, put } from 'redux-saga/effects';
import { indicatorStore, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import indicatorApi from '@/api/indicators.api';
import { parseCookies } from 'nookies';

function* fetchIndicator() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });

      const { defaultValueFilterIndicator } = yield* all({
         defaultValueFilterIndicator: select(indicatorStore.selectDefaultValueFilterIndicator),
      });

      const cookies = parseCookies();
      const jsonDataFilter = cookies['indicatorTableFilter'];
      let dataFilter;
      if (jsonDataFilter) {
         dataFilter = JSON.parse(String(jsonDataFilter));
         yield put(indicatorStore.actions.setDataFilter(dataFilter));
      } else {
         dataFilter = defaultValueFilterIndicator;
      }

      // dataFilter bubble chart
      const jsonIndicatorBubbleChart = cookies['indicatorBubbleChartFilter'];
      let dataFilterBubbleChart;

      if (jsonIndicatorBubbleChart) {
         dataFilterBubbleChart = JSON.parse(String(jsonIndicatorBubbleChart));
         yield put(indicatorStore.actions.setDataFilterBubbleChart(dataFilterBubbleChart));
      } else {
         dataFilterBubbleChart = {
            regions: null,
            countries: [],
            classes: [],
            categories: [],
            series: [],
         };
      }

      // get data for Line Chart Region
      const dataForLineChartRegion = yield* call(indicatorApi.getDataLineChartRegion, dataFilter);
      const lineChartRegionData = JSON.parse(String(dataForLineChartRegion.data)).lineChartRegion;
      yield put(indicatorStore.actions.setInitDataForLineChartRegion(lineChartRegionData));

      // get data for Line Chart Plant
      const dataForLineChartPlant = yield* call(indicatorApi.getDataLineChartPlant, dataFilter);
      const lineChartPlantData = JSON.parse(String(dataForLineChartPlant.data)).lineChartPlant;
      yield put(indicatorStore.actions.setInitDataForLineChartPlant(lineChartPlantData));

      // get data for filter
      const initDataFilter = yield* call(indicatorApi.getInitDataFilter);
      yield put(indicatorStore.actions.setInitDataFilter(JSON.parse(initDataFilter.data)));

      // get data for table
      const dataListIndicator = yield* call(indicatorApi.getIndicators, dataFilter, {
         pageNo: tableState.pageNo,
         perPage: tableState.perPage,
      });
      const dataListIndicatorObject = JSON.parse(String(dataListIndicator.data)).listCompetitor;
      yield put(indicatorStore.actions.setIndicatorList(dataListIndicatorObject));

      const dataTotalRow = JSON.parse(String(dataListIndicator.data)).total;
      yield put(indicatorStore.actions.setTotalRow(dataTotalRow));

      yield put(
         commonStore.actions.setTableState({
            totalItems: JSON.parse(String(dataListIndicator.data)).totalItems,
         })
      );
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(indicatorStore.sagaGetList, fetchIndicator);
}

export default dashboardSaga;
