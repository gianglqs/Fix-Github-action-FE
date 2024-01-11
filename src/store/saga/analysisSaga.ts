import { takeEvery, put } from 'redux-saga/effects';
import { marginAnalysisStore } from '../reducers';
import { call } from 'typed-redux-saga';
import marginAnalysisApi from '@/api/marginAnalysis.api';

function* fetchMarginAnalysis() {
   try {
   } catch (error) {}
}

function* marginAnalysisSaga() {
   yield takeEvery(marginAnalysisStore.sagaGetList, fetchMarginAnalysis);
}

export default marginAnalysisSaga;
