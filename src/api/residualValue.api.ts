import HttpService from '@/helper/HttpService';

class ResidualValueApi extends HttpService<any> {
   getInitDataFilterForModelTypeAndBrand = () => {
      return this.get('filters/getAllModelTypeAndBrand');
   };

   getInitDataFilterForModelCode = (modelType: string, brand: string) => {
      return this.getDataList<any>('filters/modelCodeOfResidualValue', { modelType, brand });
   };

   getListResidualValue = (modelCode: string) => {
      return this.getDataList<any>('residualValue/getResidualValueData', { modelCode });
   };

   importDataResidualValue = (data: any) => {
      return this.importData<any>('residualValue/importData', data);
   };
   getExampleUuploadFile = () => {
      return this.get<any>('residualValue/get-residual-value-example-upload');
   };
}

const residualValueApi = new ResidualValueApi('residualValue');

export default residualValueApi;
