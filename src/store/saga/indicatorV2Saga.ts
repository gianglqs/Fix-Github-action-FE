import { takeEvery, put } from 'redux-saga/effects';
import { indicatorV2Store, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import indicatorV2Api from '@/api/indicatorV2.api';
//types
import { ChartData} from '@/types/competitor';
//others
import { mapCompetitorFiltersToOptionValues, mappingCompetitorsToChartData } from '@/utils/mapping';
function* fetchIndicator() {
   try {
    //  const cookies = parseCookies();
        // dataFilter bubble chart
      /*  const jsonIndicatorBubbleChart = cookies['indicatorSelectedFilter'];
        let chartSelectedFilters : ChartSelectedFilters ;
  
        if (jsonIndicatorBubbleChart) {
            chartSelectedFilters = JSON.parse(String(jsonIndicatorBubbleChart));
           yield put(indicatorV2Store.actions.setChartSelectedFilters(chartSelectedFilters));
        } else {
            chartSelectedFilters = defaultValueChartSelectedFilterIndicator;
        }
        
        console.log("getSagaList "+ chartSelectedFilters);
        console.log(chartSelectedFilters);*/
      const { chartSelectedFilters } = yield* all({
         chartSelectedFilters: select(indicatorV2Store.selectChartSelectedFilters),
      });
      const { currentFilterOptions } = yield* all({
         currentFilterOptions: select(indicatorV2Store.selectChartFilterOptions),
      });
      // get data for select options
      const chartFilterOptionsRawData = yield* call(indicatorV2Api.getChartFilters, chartSelectedFilters);
      const chartFilterOptions = mapCompetitorFiltersToOptionValues(chartFilterOptionsRawData?.data||{});
      yield put(indicatorV2Store.actions.setChartFilterOptions({...currentFilterOptions,...chartFilterOptions}));

      // get data for Chart 
      const chartRawData = yield* call(indicatorV2Api.getChartData, chartSelectedFilters);
      const chartData : ChartData  =  mappingCompetitorsToChartData(chartRawData?.data?.competitiveLandscape||[]);
      yield put(indicatorV2Store.actions.setChartData(chartData));
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
