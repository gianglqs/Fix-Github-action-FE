import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class ShipmentApi extends HttpService<any> {
   getInitDataFilter = () => {
      return this.get<any>(`filters/shipment`);
   };

   getShipments = <T = any>(
      data = {} as Record<string, any>,
      params = {} as Record<string, any>,
      context: GetServerSidePropsContext = null as any,
      responseType = 'default' as ResponseType
   ) => {
      this.saveToken(context);
      return this.instance.post<T>(`getShipmentData`, data, { params, responseType });
   };
   importDataShipment = (data: any) => {
      return this.importData<any>('importNewShipment', data);
   };
}

const shipmentApi = new ShipmentApi('shipment');

export default shipmentApi;
