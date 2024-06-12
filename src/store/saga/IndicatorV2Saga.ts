import { selectDataFilterBubbleChart } from './../reducers/indicator.reducer';
import { takeEvery, put } from 'redux-saga/effects';
import { indicatorV2Store, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import indicatorV2Api from '@/api/indicatorV2.api';
import { parseCookies } from 'nookies';
//types
import { ChartSelectedFilters } from '@/types/competitor';
//others
import { defaultValueChartSelectedFilterIndicator } from '@/utils/defaultValues';
function* fetchIndicator() {
   try {
      const cookies = parseCookies();

        // dataFilter bubble chart
        const jsonIndicatorBubbleChart = cookies['indicatorChartSelectedFilter'];
        let chartSelectedFilters : ChartSelectedFilters ;
  
        if (jsonIndicatorBubbleChart) {
            chartSelectedFilters = JSON.parse(String(jsonIndicatorBubbleChart));
           yield put(indicatorV2Store.actions.setChartSelectedFilters(chartSelectedFilters));
        } else {
            chartSelectedFilters = defaultValueChartSelectedFilterIndicator;
        }

      // get data for select options
      const chartSelectedOptions = yield* call(indicatorV2Api.getChartFilters, chartSelectedFilters);
      const chartSe = JSON.parse(String(chartSelectedOptions.data)).lineChartRegion;
      /*
      yield put(indicatorV2Store.actions.setChartFilterOptions(lineChartRegionData));

      const dataServerTimeZone = JSON.parse(String(dataListIndicator.data)).serverTimeZone;
      const dataLastUpdatedTime = JSON.parse(String(dataListIndicator.data)).lastUpdatedTime;
      const dataLastUpdatedBy = JSON.parse(String(dataListIndicator.data)).lastUpdatedBy;

      yield put(indicatorV2Store.actions.setServerTimeZone(dataServerTimeZone));
      yield put(indicatorV2Store.actions.setLastUpdatedTime(dataLastUpdatedTime));
      yield put(indicatorV2Store.actions.setLastUpdatedBy(dataLastUpdatedBy)); */
   } catch (error) {}
}

function* dashboardSaga() {
   yield takeEvery(indicatorV2Store.sagaGetList, fetchIndicator);
}

export default dashboardSaga;
