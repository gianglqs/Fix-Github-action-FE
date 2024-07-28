import checkProcessingApi from '@/api/checkProcessing.api';
import marginAnalysisApi from '@/api/marginAnalysis.api';
import { delay, put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { commonStore, marginAnalysisStore } from '../reducers';
import {
   OptionFilterFromCalculateFile,
   OptionsFilterQuotationMargin,
} from '@/types/quotationMargin';

function* getDataViewPrevious() {
   try {
      const { fileUUID } = yield* all({
         fileUUID: select(marginAnalysisStore.selectFileUUID),
      });

      const { dataFilter } = yield* all({
         dataFilter: select(marginAnalysisStore.selectDataFilter),
      });

      const transformData = {
         marginData: {
            id: {
               modelCode: dataFilter.modelCode ? dataFilter.modelCode : '',
               type: dataFilter.type ? dataFilter.type : 0,
               currency: dataFilter.currency,
            },
            fileUUID: fileUUID,
            orderNumber: dataFilter.orderNumber ? dataFilter.orderNumber : '',
            plant: 'SN',
            series: dataFilter.series,
            modelCode: dataFilter.modelCode,
         },
         region: dataFilter.region,
      };
      const { data } = yield call(
         marginAnalysisApi.estimateMarginAnalystData,
         {
            ...transformData,
         },
         'requestId'
      );
      yield put(marginAnalysisStore.actions.setMarginData(data));
      console.log(data);
      yield put(
         marginAnalysisStore.actions.setCurrency(data?.MarginAnalystSummary.annually.id.currency)
      );
   } catch (error) {
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* getExampleUploadFile() {
   try {
      const { data } = yield call(marginAnalysisApi.getExampleUploadFile);
      yield put(
         marginAnalysisStore.actions.setExampleUploadFile(JSON.parse(data).exampleUploadFile)
      );
   } catch (error) {
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* handleCalculateMarginAnalysis(action) {
   const { chosenFile } = action.payload;
   console.log(chosenFile);
   try {
      yield put(marginAnalysisStore.actions.showLoadingPage());

      let formData = new FormData();
      formData.append(chosenFile, chosenFile);

      const { data } = yield* call(marginAnalysisApi.checkFilePlant, formData);
      const types = data.marginFilters.types;
      const modelCodes = data.marginFilters.modelCodes;
      const series = data.marginFilters.series;
      const orderNumbers = data.marginFilters.orderNumbers;

      const sortCharacter = (a, b) => {
         const nameA = a.value.toUpperCase(); // ignore upper and lowercase
         const nameB = b.value.toUpperCase(); // ignore upper and lowercase
         if (nameA < nameB) {
            return -1;
         }
         if (nameA > nameB) {
            return 1;
         }
         return 0;
      };

      types.sort((a, b) => a.value - b.value);
      modelCodes.sort((a, b) => sortCharacter(a, b));
      series.sort((a, b) => sortCharacter(a, b));
      orderNumbers.sort((a, b) => sortCharacter(a, b));

      const optionsFilter: OptionFilterFromCalculateFile = {
         type: types,
         orderNumber: orderNumbers,
         modelCode: modelCodes,
         series: series,
      };

      yield put(marginAnalysisStore.actions.updateOptionFilterFromCalculateFile(optionsFilter));
      yield put(marginAnalysisStore.actions.hideLoadingPage());
   } catch (error) {
      yield put(marginAnalysisStore.actions.hideLoadingPage());
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* handleCalculateMarginAnalysisSaga() {
   yield takeEvery(marginAnalysisStore.openCalculatorFile, handleCalculateMarginAnalysis);
}

function* fetchLoadingQuotationMarginPage() {
   //yield takeEvery(marginAnalysisStore.sagaGetList, getLoadingPage);
}

function* fetchDataViewPrevious() {
   // yield takeEvery(marginAnalysisStore.sagaGetList, getDataViewPrevious);
}

function* fetchExampleUploadFile() {
   yield takeEvery(marginAnalysisStore.sagaGetList, getExampleUploadFile);
}

export {
   fetchDataViewPrevious,
   fetchLoadingQuotationMarginPage,
   fetchExampleUploadFile,
   handleCalculateMarginAnalysisSaga,
};
