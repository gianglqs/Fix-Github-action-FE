import { combineReducers } from 'redux';
import user from './user.reducer';
import common from './common.reducer';
import booking from './booking.reducer';
import marginAnalysis from './analysis.reducer';
import indicator from './indicator.reducer';
import shipment from './shipment.reducer';
import outlier from './outlier.reducer';
import trends from './trends.reducer';
import adjustment from './adjustment.reducer';
import competitorColor from './competitorColor.reducer';
import product from './product.reducer';
import part from './part.reducer';

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
});

export type RootReducerType = ReturnType<typeof rootReducers>;

export default rootReducers;
