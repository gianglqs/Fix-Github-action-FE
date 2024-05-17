import checkProcessingApi from '@/api/checkProcessing.api';
import marginAnalysisApi from '@/api/marginAnalysis.api';
import { delay, put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { commonStore, marginAnalysisStore } from '../reducers';

function* getLoadingPage() {
   try {
      const { requestId } = yield* all({
         requestId: select(marginAnalysisStore.selectRequestId),
      });

      if (requestId) {
         yield put(marginAnalysisStore.actions.setLoadingPage(true));
         while (true) {
            const { data } = yield call(checkProcessingApi.checkProcessing, { requestId });

            if (data === '') break;

            const processingData = JSON.parse(String(data));
            if (processingData.state == 'success') {
               yield put(commonStore.actions.setSuccessMessage(processingData.message));
               break;
            } else if (processingData.state == 'error') {
               yield put(commonStore.actions.setErrorMessage(processingData.message));
               break;
            }

            yield delay(2000);
         }

         yield put(marginAnalysisStore.actions.setLoadingPage(false));
         yield put(marginAnalysisStore.actions.setRequestId(undefined));
      }
   } catch (error) {
      console.log(error);
   }
}

function* getDataViewPrevious() {
   try {
      const { fileUUID } = yield* all({
         fileUUID: select(marginAnalysisStore.selectFileUUID),
      });

      const { dataFilter } = yield* all({
         dataFilter: select(marginAnalysisStore.selectDataFilter),
      });

      const transformData = {
         marginData: {
            id: {
               modelCode: dataFilter.modelCode ? dataFilter.modelCode : '',
               type: dataFilter.type ? dataFilter.type : 0,
               currency: dataFilter.currency,
            },
            fileUUID: fileUUID,
            orderNumber: dataFilter.orderNumber ? dataFilter.orderNumber : '',
            plant: 'SN',
            series: dataFilter.series,
         },
         region: dataFilter.region,
      };
      const { data } = yield call(
         marginAnalysisApi.estimateMarginAnalystData,
         {
            ...transformData,
         },
         'requestId'
      );
      yield put(marginAnalysisStore.actions.setMarginData(data));
      console.log(data);
      yield put(
         marginAnalysisStore.actions.setCurrency(data.MarginAnalystSummary.annually.id.currency)
      );
   } catch (error) {
      console.log(error);
   }
}

function* fetchLoadingQuotationMarginPage() {
   yield takeEvery(marginAnalysisStore.sagaGetList, getLoadingPage);
}

function* fetchDataViewPrevious() {
   yield takeEvery(marginAnalysisStore.sagaGetList, getDataViewPrevious);
}

export { fetchDataViewPrevious, fetchLoadingQuotationMarginPage };
