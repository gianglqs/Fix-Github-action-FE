import marginAnalysisApi from '@/api/marginAnalysis.api';
import { OptionFilterFromCalculateFile } from '@/types/quotationMargin';
import { put, takeEvery } from 'redux-saga/effects';
import { all, call, select } from 'typed-redux-saga';
import { commonStore, marginAnalysisStore } from '../reducers';
import { formatNumberPercentage } from '@/utils/formatCell';

function* handleEstimateMargin() {
   yield put(marginAnalysisStore.actions.showLoadingPage());
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
      const { data } = yield call(marginAnalysisApi.estimateMarginAnalystData, {
         ...transformData,
      });

      const analysisSummary = data?.MarginAnalystSummary;
      const marginAnalystData = data?.MarginAnalystData;

      marginAnalystData.forEach((margin) => {
         margin.discount = formatNumberPercentage(margin.discount * 100);
         margin.listPrice = margin.listPrice.toLocaleString();
         margin.manufacturingCost = margin.manufacturingCost.toLocaleString();
         margin.dealerNet = margin.dealerNet.toLocaleString();
      });

      const marginData = {
         targetMargin: data?.TargetMargin,
         listDataAnalysis: marginAnalystData,
         marginAnalysisSummary: analysisSummary,
      };

      yield put(marginAnalysisStore.actions.setMarginData(marginData));
      yield put(
         marginAnalysisStore.actions.setCurrency(data?.MarginAnalystSummary.annually.id.currency)
      );
      yield put(marginAnalysisStore.actions.hideLoadingPage());
   } catch (error) {
      yield put(marginAnalysisStore.actions.hideLoadingPage());
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

function* handleOpenCulculateFile(action) {
   const file = action.payload;
   try {
      yield put(marginAnalysisStore.actions.showLoadingPage());

      let formData = new FormData();
      formData.append('file', file);

      const { data } = yield* call(marginAnalysisApi.checkFilePlant, formData);

      yield put(marginAnalysisStore.actions.setFileUUID(data.fileUUID));
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

      yield put(
         marginAnalysisStore.actions.updateOptionsFilterAfterOpenCalculateFile(optionsFilter)
      );
      yield put(marginAnalysisStore.actions.hideLoadingPage());
   } catch (error) {
      yield put(marginAnalysisStore.actions.hideLoadingPage());
      yield put(commonStore.actions.setErrorMessage(error.message));
   }
}

function* handleOpenCalculateFileSaga() {
   yield takeEvery(marginAnalysisStore.openCalculatorFile, handleOpenCulculateFile);
}

function* fetchLoadingQuotationMarginPage() {
   //yield takeEvery(marginAnalysisStore.sagaGetList, getLoadingPage);
}

function* handleEstimateMarginSaga() {
   yield takeEvery(marginAnalysisStore.estimateMargin, handleEstimateMargin);
}

function* fetchExampleUploadFile() {
   yield takeEvery(marginAnalysisStore.sagaGetList, getExampleUploadFile);
}

export {
   fetchExampleUploadFile,
   fetchLoadingQuotationMarginPage,
   handleEstimateMarginSaga,
   handleOpenCalculateFileSaga,
};
