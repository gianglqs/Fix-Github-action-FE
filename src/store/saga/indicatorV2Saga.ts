import { takeEvery, put } from 'redux-saga/effects';
import { indicatorV2Store, commonStore } from '../reducers';
import { select, call, all } from 'typed-redux-saga';
import indicatorV2Api from '@/api/indicatorV2.api';
//types
import { ChartData } from '@/types/competitor';
//others
import {
   mapCompetitorFiltersToOptionValues,
   mappingCompetitorsToChartData,
   mappingCompetitorsToTableData,
} from '@/utils/mapping';
function* fetchTableData() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });
      const { chartSelectedFilters } = yield* all({
         chartSelectedFilters: select(indicatorV2Store.selectChartSelectedFilters),
      });

      // get data for table
      const dataCompetitorsRaw = yield* call(
         indicatorV2Api.getCompetitorData,
         chartSelectedFilters,
         {
            pageNo: tableState.pageNo,
            perPage: tableState.perPage,
         }
      );
      const mappedDataCompetitors = mappingCompetitorsToTableData(dataCompetitorsRaw?.data);
      yield put(indicatorV2Store.actions.setTableData(mappedDataCompetitors.tableData));

      yield put(indicatorV2Store.actions.setAverageStats(mappedDataCompetitors.averageStats));

      yield put(
         commonStore.actions.setTableState({
            totalItems: mappedDataCompetitors.totalItems,
         })
      );
      yield put(indicatorV2Store.actions.setServerTimeZone(mappedDataCompetitors.serverTimeZone));
      yield put(indicatorV2Store.actions.setLastUpdatedTime(mappedDataCompetitors.lastUpdatedTime));
      yield put(indicatorV2Store.actions.setLastUpdatedBy(mappedDataCompetitors.lastUpdatedBy));
   } catch (err) {}
}
function* fetchIndicator() {
   try {
      const { tableState } = yield* all({
         tableState: select(commonStore.selectTableState),
      });
      const { chartSelectedFilters } = yield* all({
         chartSelectedFilters: select(indicatorV2Store.selectChartSelectedFilters),
      });
      const { currentFilterOptions } = yield* all({
         currentFilterOptions: select(indicatorV2Store.selectChartFilterOptions),
      });
      // get data for select options
      const chartFilterOptionsRawData = yield* call(
         indicatorV2Api.getChartFilters,
         chartSelectedFilters
      );
      const chartFilterOptions = mapCompetitorFiltersToOptionValues(
         chartFilterOptionsRawData?.data || {}
      );
      yield put(
         indicatorV2Store.actions.setChartFilterOptions({
            ...currentFilterOptions,
            ...chartFilterOptions,
         })
      );

      // get data for Chart
      const chartRawData = yield* call(indicatorV2Api.getChartData, chartSelectedFilters);
      const chartData: ChartData = mappingCompetitorsToChartData(
         chartRawData?.data?.competitiveLandscape || []
      );
      yield put(indicatorV2Store.actions.setChartData(chartData));

      // get data for table
      const dataCompetitorsRaw = yield* call(
         indicatorV2Api.getCompetitorData,
         chartSelectedFilters,
         {
            pageNo: tableState.pageNo,
            perPage: tableState.perPage,
         }
      );
      const mappedDataCompetitors = mappingCompetitorsToTableData(dataCompetitorsRaw?.data);
      yield put(indicatorV2Store.actions.setTableData(mappedDataCompetitors.tableData));

      yield put(indicatorV2Store.actions.setAverageStats(mappedDataCompetitors.averageStats));

      yield put(
         commonStore.actions.setTableState({
            totalItems: mappedDataCompetitors.totalItems,
         })
      );
      yield put(indicatorV2Store.actions.setServerTimeZone(mappedDataCompetitors.serverTimeZone));
      yield put(indicatorV2Store.actions.setLastUpdatedTime(mappedDataCompetitors.lastUpdatedTime));
      yield put(indicatorV2Store.actions.setLastUpdatedBy(mappedDataCompetitors.lastUpdatedBy));
   } catch (error) {}
}

function* fetchDashboard() {
   yield takeEvery(indicatorV2Store.sagaGetList, fetchIndicator);
}
function* fetchTableIndicator() {
   yield takeEvery(indicatorV2Store.fetchTable, fetchTableData);
}

export { fetchDashboard, fetchTableIndicator };
