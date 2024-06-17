import { fork } from 'redux-saga/effects';
import userSaga from './userSaga';
import { fetchBooking, switchCurrencyBooking } from './bookingSaga';
import { fetchLoadingQuotationMarginPage, fetchDataViewPrevious } from './analysisSaga';
import indicatorSaga from './indicatorSaga';
import { fetchShipment, switchCurrencyShipment } from './shipmentSaga';
import outlierSaga from './outlierSaga';
import trendsSaga from './trendsSaga';
import adjustmentSaga from './adjustmentSaga';
import competitorColorSaga from './competitorColorSaga';
import productSaga from './productSaga';
import partSaga from './partSaga';
import historicalImportSaga from './historicalImportSaga';
import volumeDiscountSaga from './volumeDiscountSaga';
import bookingMarginTrialTestSaga from './bookingMarginTrialTestSaga';
import importFailureSaga from './importFailureSaga';
import priceVolumeSensitivitySaga from './priceVolumeSensitivitySaga';
import gumSaga from './gumSaga';
import { fetchDashboard, fetchTableIndicator } from './indicatorV2Saga';
import {
   fetchModelCodeSaga,
   fetchFirstResidualValue,
   fetchDataResidualValueSaga,
} from './residualValueSaga';

import { fetchImportTracking } from './importTrackingSaga';
import managerCompetitorSaga from './manageCompetitorSaga';

function* rootSaga() {
   yield fork(userSaga);
   yield fork(fetchBooking);
   yield fork(switchCurrencyBooking);
   yield fork(fetchLoadingQuotationMarginPage);
   yield fork(fetchDataViewPrevious);
   yield fork(indicatorSaga);
   //shipment
   yield fork(fetchShipment);
   yield fork(switchCurrencyShipment);
   yield fork(outlierSaga);
   yield fork(trendsSaga);
   yield fork(adjustmentSaga);
   yield fork(competitorColorSaga);
   yield fork(productSaga);
   yield fork(partSaga);
   yield fork(historicalImportSaga);
   yield fork(volumeDiscountSaga);
   yield fork(bookingMarginTrialTestSaga);
   yield fork(gumSaga);
   yield fork(importFailureSaga);
   yield fork(priceVolumeSensitivitySaga);
   yield fork(fetchFirstResidualValue);
   yield fork(fetchModelCodeSaga);
   yield fork(fetchDataResidualValueSaga);
   yield fork(fetchImportTracking);
   yield fork(managerCompetitorSaga);
   //competitor benchmark
   yield fork(fetchDashboard);
   yield fork(fetchTableIndicator);
}

export default rootSaga;
