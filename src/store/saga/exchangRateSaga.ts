import exchangeRatesApi from '@/api/exchangeRates.api';
import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeEvery } from 'redux-saga/effects';
import { call } from 'typed-redux-saga';
import { commonStore, exchangeRateStore } from '../reducers';

function* handleUploadExchangeRateFile(action: PayloadAction<File>) {
   try {
      yield put(exchangeRateStore.actions.showLoadingPage());
      let formData = new FormData();
      const file = action.payload;
      formData.append('file', file);

      const { data } = yield* call(exchangeRatesApi.uploadExchangeRate, formData);

      yield put(commonStore.actions.setSuccessMessage(data.message));
      yield put(exchangeRateStore.actions.hideLoadingPage());
   } catch (error) {
      yield put(exchangeRateStore.actions.hideLoadingPage());
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* handleUploadExchangeRateFileSaga() {
   yield takeEvery(exchangeRateStore.uploadExchangeRateFile, handleUploadExchangeRateFile);
}

export { handleUploadExchangeRateFileSaga };
