import { combineReducers } from 'redux';
import user from './user.reducer';
import common from './common.reducer';
import booking from './booking.reducer';
import marginAnalysis from './analysis.reducer';
import indicator from './indicator.reducer';
import manageCompetitor from './manageCompetitor.reducer';
import shipment from './shipment.reducer';
import outlier from './outlier.reducer';
import trends from './trends.reducer';
import adjustment from './adjustment.reducer';
import competitorColor from './competitorColor.reducer';
import product from './product.reducer';
import part from './part.reducer';
import historicalImport from './historicalImport.reducer';
import volumeDiscount from './volumeDiscount.reducer';
import bookingMarginTrialTest from './bookingMarginTrialTest.reducer';
import importFailure from './importFailure.reducer';
import priceVolumeSensitivity from './priceVolumeSensitivity.reducer';
import residualValue from './residualValue.reducer';
import importTracking from './importTracking.reducer';
import gum from './gum.reducer';
import indicatorV2 from './indicatorV2.reducer';
import longTermRental from './longTermRental.reducer';
import auth from './auth.reducer';
import exchangeRate from './exchangeRate.reducer';
const rootReducers = combineReducers({
   [common.name]: common.reducer,
   [user.name]: user.reducer,
   [booking.name]: booking.reducer,
   [marginAnalysis.name]: marginAnalysis.reducer,
   [indicator.name]: indicator.reducer,
   [shipment.name]: shipment.reducer,
   [outlier.name]: outlier.reducer,
   [trends.name]: trends.reducer,
   [adjustment.name]: adjustment.reducer,
   [competitorColor.name]: competitorColor.reducer,
   [product.name]: product.reducer,
   [part.name]: part.reducer,
   [historicalImport.name]: historicalImport.reducer,
   [volumeDiscount.name]: volumeDiscount.reducer,
   [bookingMarginTrialTest.name]: bookingMarginTrialTest.reducer,
   [importFailure.name]: importFailure.reducer,
   [priceVolumeSensitivity.name]: priceVolumeSensitivity.reducer,
   [residualValue.name]: residualValue.reducer,
   [importTracking.name]: importTracking.reducer,
   [gum.name]: gum.reducer,
   [manageCompetitor.name]: manageCompetitor.reducer,
   [indicatorV2.name]: indicatorV2.reducer,
   [longTermRental.name]: longTermRental.reducer,
   [auth.name]: auth.reducer,
   [exchangeRate.name]: exchangeRate.reducer,
});

export type RootReducerType = ReturnType<typeof rootReducers>;

export default rootReducers;
