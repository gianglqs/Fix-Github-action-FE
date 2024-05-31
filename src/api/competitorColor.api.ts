import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';
import { ResponseType } from 'axios';

class CompetitorColorApi extends HttpService<any> {
   getCompetitorColor = (params = {} as Record<string, any>) => {
      return this.get<any>(`competitorColors`, params);
   };

   getCompetitorColorById = (params = {} as Record<string, any>) => {
      return this.get<any>(`competitorColors/getDetails`, params);
   };

   updateCompetitorColor = (data: any) => {
      return this.put<any>(`competitorColors`, {}, data);
   };
}

const competitorColorApi = new CompetitorColorApi('competitorColor');

export default competitorColorApi;
