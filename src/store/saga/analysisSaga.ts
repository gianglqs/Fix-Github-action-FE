import { takeEvery, put } from 'redux-saga/effects';
import { marginAnalysisStore } from '../reducers';
import { all, call, select } from 'typed-redux-saga';
import checkProcessingApi from '@/api/checkProcessing.api';
import { parseCookies } from 'nookies';

function* fetchMarginAnalysis() {
   try {
      const cookies = parseCookies();
      const requestId = cookies['quotation-margin/requestId'];

      console.log('requestId  ', requestId);
      if (requestId) {
         yield put(marginAnalysisStore.actions.setLoadingPage(true));
         console.log('interval');
         const checkProcessingId = setInterval(() => {
            checkProcessingApi.checkProcessing(requestId).then((res) => {
               console.log(res);

               if (res.data) clearInterval(checkProcessingId);
            });
         }, 5000);

         // yield put(marginAnalysisStore.actions.setDataFilter(dataFilter));

         // revoke request id
      }
   } catch (error) {}
}

function* marginAnalysisSaga() {
   yield takeEvery(marginAnalysisStore.sagaGetList, fetchMarginAnalysis);
}

export default marginAnalysisSaga;
