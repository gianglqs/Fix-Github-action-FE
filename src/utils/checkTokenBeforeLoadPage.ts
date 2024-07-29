import axios from 'axios';
import {
   refreshTokenForFunctionGetServerSideProps,
   refreshTokenForFunctionGetServerSidePropsLogin,
} from './refreshToken';

import { parseCookies } from 'nookies';
import { GetServerSidePropsContext } from 'next';
import { PATH_ADMIN_USER, PATH_BOOKING, PATH_LOGIN } from '@/Path/frontend';
import { CHECK_TOKEN_ADMIN_URL, CHECK_TOKEN_URL } from '@/Path/backend';

export const checkTokenBeforeLoadPage = async (context: GetServerSidePropsContext) => {
   try {
      const cookies = parseCookies(context);
      const accessToken = cookies['token'];
      await axios.post(CHECK_TOKEN_URL, null, {
         headers: {
            Authorization: 'Bearer ' + accessToken,
         },
      });

      return {
         props: {},
      };
   } catch (error) {
      return refreshTokenForFunctionGetServerSideProps(context);
   }
};

export const checkTokenBeforeLoadPageAdmin = async (context: GetServerSidePropsContext) => {
   try {
      const cookies = parseCookies(context);
      const accessToken = cookies['token'];

      await axios.post(CHECK_TOKEN_ADMIN_URL, null, {
         headers: {
            Authorization: 'Bearer ' + accessToken,
         },
      });
      return {
         props: {},
      };
   } catch (error) {
      if (error.response?.status == null)
         return {
            redirect: {
               destination: '/505',
               permanent: true,
            },
         };

      if (error.response?.status == 401) return refreshTokenForFunctionGetServerSideProps(context);

      var des = PATH_LOGIN;
      if (error.response?.status == 403) des = PATH_BOOKING;
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

      await axios.post(CHECK_TOKEN_ADMIN_URL, null, {
         headers: {
            Authorization: 'Bearer ' + accessToken,
         },
      });
      return {
         redirect: {
            destination: PATH_ADMIN_USER,
            permanent: false,
         },
      };
   } catch (error) {
      if (error.response?.status == 401)
         return refreshTokenForFunctionGetServerSidePropsLogin(error, context);

      if (error.response?.status == 403)
         return {
            redirect: {
               destination: PATH_BOOKING,
               permanent: true,
            },
         };

      if (error.response?.status == null)
         return {
            redirect: {
               destination: '/505',
               permanent: true,
            },
         };
      const imageTagFE = process.env.IMAGE_TAG_ENV;
      const releaseTagFE = process.env.RELEASE_TAG_ENV;

      return { props: { imageTagFE, releaseTagFE } };
   }
};
