import { takeEvery, put, delay } from 'redux-saga/effects';
import { commonStore, marginAnalysisStore } from '../reducers';
import { all, call, select } from 'typed-redux-saga';
import checkProcessingApi from '@/api/checkProcessing.api';
import { destroyCookie, parseCookies } from 'nookies';
import marginAnalysisApi from '@/api/marginAnalysis.api';

function* getLoadingPage() {
   try {
      const cookies = parseCookies();
      const requestId = cookies['quotation-margin/requestId'];

      if (requestId) {
         yield put(marginAnalysisStore.actions.setLoadingPage(true));

         while (true) {
            console.log('hehehe');
            const { data } = yield call(checkProcessingApi.checkProcessing, { requestId });

            console.log('data day', data);

            if (data === '') break;

            const processingData = JSON.parse(String(data));
            if (processingData.state == 'success') {
               yield put(commonStore.actions.setSuccessMessage(processingData.message));
               break;
            } else if (processingData.state == 'error') {
               yield put(commonStore.actions.setErrorMessage(processingData.message));
               break;
            }

            yield delay(5000);
         }

         yield put(marginAnalysisStore.actions.setLoadingPage(false));
         destroyCookie(null, 'quotation-margin/requestId', { path: '/' });

         // revoke request id
      }
   } catch (error) {
      console.log(error);
   }
}

function* getDataViewPrevious() {
   try {
      const { data } = yield call(marginAnalysisApi.getPreviousDataView);
      const dataConvert = JSON.parse(String(data));

      yield put(
         marginAnalysisStore.actions.setInitDataFilter({
            modelCode: dataConvert.modelCodeFilters,
            series: dataConvert.seriesFilters,
            orderNumber: dataConvert.orderNumberFilters,
            type: dataConvert.typeFilters,
         })
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

export { fetchLoadingQuotationMarginPage, fetchDataViewPrevious };
