import { fork } from 'redux-saga/effects';
import adjustmentSaga from './adjustmentSaga';
import {
   fetchExampleUploadFile,
   handleEstimateMarginSaga,
   handleOpenCalculateFileSaga,
   handleUploadMacroFileSaga,
   handleUploadPowerBIFileSaga,
} from './analysisSaga';
import bookingMarginTrialTestSaga from './bookingMarginTrialTestSaga';
import { fetchBooking, switchCurrencyBooking } from './bookingSaga';
import competitorColorSaga from './competitorColorSaga';
import gumSaga from './gumSaga';
import historicalImportSaga from './historicalImportSaga';
import importFailureSaga from './importFailureSaga';
import indicatorSaga from './indicatorSaga';
import { fetchDashboard, fetchTableIndicator } from './indicatorV2Saga';
import outlierSaga from './outlierSaga';
import partSaga from './partSaga';
import priceVolumeSensitivitySaga from './priceVolumeSensitivitySaga';
import { fetchProductDataForTableSaga, handleUploadProductFileSaga } from './productSaga';
import {
   fetchDataResidualValueSaga,
   fetchFirstResidualValue,
   fetchModelCodeSaga,
   handleUploadRV_AICFileSaga,
} from './residualValueSaga';
import {
   fetchShipment,
   handleUploadShipmentFileSaga,
   switchCurrencyShipment,
} from './shipmentSaga';
import trendsSaga from './trendsSaga';
import userSaga from './userSaga';
import volumeDiscountSaga from './volumeDiscountSaga';

import { fetchImportTracking } from './importTrackingSaga';
import managerCompetitorSaga from './manageCompetitorSaga';

function* rootSaga() {
   yield fork(userSaga);
   yield fork(fetchBooking);
   yield fork(switchCurrencyBooking);
   yield fork(handleUploadMacroFileSaga);
   yield fork(handleUploadPowerBIFileSaga);
   yield fork(handleEstimateMarginSaga);
   yield fork(handleOpenCalculateFileSaga);
   yield fork(fetchExampleUploadFile);
   yield fork(indicatorSaga);
   //shipment
   yield fork(fetchShipment);
   yield fork(switchCurrencyShipment);
   yield fork(handleUploadShipmentFileSaga);

   //outlier
   yield fork(outlierSaga);
   yield fork(trendsSaga);
   yield fork(adjustmentSaga);
   yield fork(competitorColorSaga);

   // Product
   yield fork(fetchProductDataForTableSaga);
   yield fork(handleUploadProductFileSaga);

   yield fork(partSaga);
   yield fork(historicalImportSaga);
   yield fork(volumeDiscountSaga);
   yield fork(bookingMarginTrialTestSaga);
   yield fork(gumSaga);
   yield fork(importFailureSaga);
   yield fork(priceVolumeSensitivitySaga);

   // Residual value
   yield fork(fetchFirstResidualValue);
   yield fork(fetchModelCodeSaga);
   yield fork(fetchDataResidualValueSaga);
   yield fork(handleUploadRV_AICFileSaga);

   // import tracking
   yield fork(fetchImportTracking);
   yield fork(managerCompetitorSaga);
   //competitor benchmark
   yield fork(fetchDashboard);
   yield fork(fetchTableIndicator);
}

export default rootSaga;
