import { fork } from 'redux-saga/effects';
import userSaga from './userSaga';
import bookingSaga from './bookingSaga';
import marginAnalysisSaga from './analysisSaga';
import indicatorSaga from './indicatorSaga';
import shipmentSaga from './shipmentSaga';
import outlierSaga from './outlierSaga';
import trendsSaga from './trendsSaga';
import adjustmentSaga from './adjustmentSaga';
import competitorColorSaga from './competitorColorSaga';
import productSaga from './productSaga';
import partSaga from './partSaga';
import historicalImportSaga from './historicalImportSaga';

function* rootSaga() {
   yield fork(userSaga);
   yield fork(bookingSaga);
   yield fork(marginAnalysisSaga);
   yield fork(indicatorSaga);
   yield fork(shipmentSaga);
   yield fork(outlierSaga);
   yield fork(trendsSaga);
   yield fork(adjustmentSaga);
   yield fork(competitorColorSaga);
   yield fork(productSaga);
   yield fork(partSaga);
   yield fork(historicalImportSaga);
}

export default rootSaga;
