import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { GetServerSidePropsContext } from 'next';

export const refreshTokenForFunctionGetServerSideProps = async (
   context: GetServerSidePropsContext
) => {
   try {
      const cookies = parseCookies(context);
      const refresh_token = cookies['refresh_token'];

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/refreshToken`, {
         refreshToken: refresh_token,
      });

      return {
         props: {},
      };
   } catch (error) {
      return {
         redirect: {
            destination: '/login',
            permanent: false,
         },
      };
   }
};

export const refreshTokenForFunctionGetServerSidePropsLogin = async (
   error: AxiosError,
   context: GetServerSidePropsContext
) => {
   try {
      const cookies = parseCookies(context);
      const refresh_token = cookies['refresh_token'];

      const response = await axios.post(
         `${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/refreshToken`,
         {
            refreshToken: refresh_token,
         }
      );

      const accessToken = response.data.accessToken;

      const newRequest = {
         ...error.config,
         headers: {
            ...error.config.headers,
            Authorization: 'Bearer ' + accessToken,
         },
      };

      await axios(newRequest);
      return {
         redirect: {
            destination: '/web-pricing-tools/admin/dashboard',
            permanent: false,
         },
      };
   } catch (error) {
      if (error.response?.status == 403) {
         //role: USER
         return {
            redirect: {
               destination: '/web-pricing-tools/bookingOrder',
               permanent: false,
            },
         };
      }
      return {
         props: {},
      };
   }
};
