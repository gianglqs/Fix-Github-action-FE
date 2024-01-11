import axios from 'axios';
import {
   refreshTokenForFunctionGetServerSideProps,
   refreshTokenForFunctionGetServerSidePropsLogin,
} from './refreshToken';

import { parseCookies } from 'nookies';
import { GetServerSidePropsContext } from 'next';

export const checkTokenBeforeLoadPage = async (context: GetServerSidePropsContext) => {
   try {
      const cookies = parseCookies(context);
      const accessToken = cookies['token'];
      console.log('check token truoc khi load trang');
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkToken`, null, {
         headers: {
            Authorization: 'Bearer ' + accessToken,
         },
      });
      console.log('check token thanh cong');

      return {
         props: {},
      };
   } catch (error) {
      console.log('check token loi');
      return refreshTokenForFunctionGetServerSideProps(context);
   }
};

export const checkTokenBeforeLoadPageAdmin = async (context: GetServerSidePropsContext) => {
   try {
      const cookies = parseCookies(context);
      const accessToken = cookies['token'];

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkTokenOfAdmin`, null, {
         headers: {
            Authorization: 'Bearer ' + accessToken,
         },
      });
      return {
         props: {},
      };
   } catch (error) {
      if (error.response?.status == 401) return refreshTokenForFunctionGetServerSideProps(context);

      var des = '/login';
      if (error.response?.status == 403) des = '/web-pricing-tools/bookingOrder';
      return {
         redirect: {
            destination: des,
            permanent: false,
         },
      };
   }
};

export const checkTokenBeforeLoadPageLogin = async (context: GetServerSidePropsContext) => {
   try {
      const cookies = parseCookies(context);
      const accessToken = cookies['token'];

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkTokenOfAdmin`, null, {
         headers: {
            Authorization: 'Bearer ' + accessToken,
         },
      });
      return {
         props: {},
      };
   } catch (error) {
      if (error.response?.status == 401)
         return refreshTokenForFunctionGetServerSidePropsLogin(error, context);

      var des = '/login';
      if (error.response?.status == 403) des = '/web-pricing-tools/bookingOrder';
      return {
         redirect: {
            destination: des,
            permanent: false,
         },
      };
   }
};
