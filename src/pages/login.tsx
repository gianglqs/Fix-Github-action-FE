import { styled, Paper, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormControlledTextField from '@/components/FormController/TextField';

import NextHead from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { parseCookies, setCookie } from 'nookies';
import axios from 'axios';
import * as yup from 'yup';

import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginFormValues } from '@/types/auth';
import { AppFooter } from '@/components';

import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require('../public/logo.svg');

const StyledContainer = styled('div')(() => ({
   height: `calc(100vh - ${25}px)`,
}));

const StyledFormContainer = styled(Paper)(({ theme }) => ({
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   maxWidth: 400,
   padding: theme.spacing(3),
}));

export async function getServerSideProps(context) {
   try {
      let cookies = parseCookies(context);
      let token = cookies['token'];
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkTokenOfAdmin`, null, {
         headers: {
            Authorization: 'Bearer ' + token,
         },
      });

      return {
         redirect: {
            destination: '/web-pricing-tools/admin/dashboard',
            permanent: false,
         },
      };
   } catch (error) {
      if (error.response?.status == 403)
         return {
            redirect: {
               destination: '/web-pricing-tools/bookingOrder',
               permanent: false,
            },
         };
      return {
         props: {},
      };
   }
}

export default function LoginPage() {
   const router = useRouter();

   const validationSchema = yup.object({
      email: yup.string().required('Email is required'),
      password: yup.string().required('Password is required'),
   });

   const loginForm = useForm({
      resolver: yupResolver(validationSchema),
      shouldUnregister: false,
   });

   const dispatch = useDispatch();

   const handleSubmitLogin = loginForm.handleSubmit((formData: LoginFormValues) => {
      const transformData = {
         email: formData?.email,
         password: formData?.password,
      };

      const options = {
         method: 'POST',
         headers: {
            'content-type': 'application/json',
         },
         auth: {
            username: 'client',
            password: 'password',
         },
      };
      axios
         .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/login`, transformData, options)
         .then((response) => {
            console.log(response);
            const access_token = response.data.data.access_token;
            const name = response.data.data.name;
            const role = response.data.data.role;
            setCookie(null, 'token', access_token, { maxAge: 604800, path: '/' }); // 7 days
            setCookie(null, 'role', role, { maxAge: 604800, path: '/' });
            setCookie(null, 'name', name, { maxAge: 604800, path: '/' });

            // setCookie(null, 'redirect_to', redirect_to, { maxAge: 2147483647 });
            router.push('/web-pricing-tools/admin/dashboard');
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage('Error on signing in'));
         });
   });

   return (
      <>
         <NextHead>
            <title>HysterYale - Sign in</title>
         </NextHead>
         <StyledContainer className="center-element">
            {/* <CssBaseline /> */}
            <StyledFormContainer>
               <Image src={logo} width={250} height={40} alt="Hyster-Yale" />
               <form onSubmit={handleSubmitLogin}>
                  <FormControlledTextField
                     control={loginForm.control}
                     sx={{ mt: 2 }}
                     label="Email"
                     name="email"
                  />
                  <FormControlledTextField
                     control={loginForm.control}
                     sx={{ mt: 2 }}
                     label="Password"
                     required
                     name="password"
                     autoComplete="current-password"
                     type="password"
                  />

                  <LoadingButton
                     sx={{ mt: 2 }}
                     loadingPosition="start"
                     type="submit"
                     fullWidth
                     variant="contained"
                     color="primary"
                  >
                     Sign in
                  </LoadingButton>
               </form>
               <Grid sx={{ marginTop: 1 }}>
                  <Link color="primary" href={`/reset_password`}>
                     Forgot Password
                  </Link>
               </Grid>
            </StyledFormContainer>
         </StyledContainer>
         <AppFooter />
      </>
   );
}
