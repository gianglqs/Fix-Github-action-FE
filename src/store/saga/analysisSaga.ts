import { takeEvery, put, delay } from 'redux-saga/effects';
import { marginAnalysisStore } from '../reducers';
import { all, call, select } from 'typed-redux-saga';
import checkProcessingApi from '@/api/checkProcessing.api';
import { destroyCookie, parseCookies } from 'nookies';

function* fetchMarginAnalysis() {
   try {
      const cookies = parseCookies();
      const requestId = cookies['quotation-margin/requestId'];

      if (requestId) {
         yield put(marginAnalysisStore.actions.setLoadingPage(true));

         yield call(checkProcessingApi.checkProcessing, { requestId });
         while (true) {
            console.log('hehehe');
            const { data } = yield call(checkProcessingApi.checkProcessing, { requestId });
            if (data === 'false') break;

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

function* marginAnalysisSaga() {
   yield takeEvery(marginAnalysisStore.sagaGetList, fetchMarginAnalysis);
}

export default marginAnalysisSaga;
