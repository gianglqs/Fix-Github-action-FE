import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { GetServerSidePropsContext } from 'next';
import { PATH_ADMIN_USER, PATH_BOOKING } from '@/Path/frontend';

export const refreshTokenForFunctionGetServerSideProps = async (
   context: GetServerSidePropsContext
) => {
   try {
      const cookies = parseCookies(context);
      const refresh_token = cookies['refresh_token'];

      const { data } = await axios.post(
         `${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/refreshToken`,
         {
            refreshToken: refresh_token,
         }
      );

      setCookie(context, 'token', data.data.accessToken, {
         maxAge: 604800,
         path: '/',
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

      const accessToken = response.data.data.accessToken;

      const newRequest = {
         ...error.config,
         headers: {
            ...error.config.headers,
            Authorization: 'Bearer ' + accessToken,
         },
      };

      await axios(newRequest);

      setCookie(context, 'token', accessToken, {
         maxAge: 604800,
         path: '/',
      });

      return {
         redirect: {
            destination: PATH_ADMIN_USER,
            permanent: false,
         },
      };
   } catch (error) {
      if (error.response?.status == 403) {
         //role: USER
         return {
            redirect: {
               destination: PATH_BOOKING,
               permanent: false,
            },
         };
      }

      const releaseTagFE = process.env.RELEASE_TAG_ENV;
      const imageTagFE = process.env.IMAGE_TAG_ENV;

      return {
         props: { imageTagFE, releaseTagFE },
      };
   }
};
