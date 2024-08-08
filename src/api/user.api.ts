import HttpService from '@/helper/HttpService';
import type { GetServerSidePropsContext } from 'next';

class SecurityApi extends HttpService<any> {
   getUser = (params = {} as Record<string, any>, context: GetServerSidePropsContext = null) => {
      return this.get<any>('users', params, context);
   };
}

const securityApi = new SecurityApi('user');

export default securityApi;
