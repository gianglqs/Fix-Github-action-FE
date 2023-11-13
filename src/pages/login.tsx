import { styled, Paper, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormControlledTextField from '@/components/FormController/TextField';

import NextHead from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { setCookie } from 'nookies';
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
         grant_type: 'password',
         username: formData?.email,
         password: formData?.password,
      };

      const options = {
         method: 'POST',
         headers: {
            'content-type': 'application/x-www-form-urlencoded',
         },
         auth: {
            username: 'client',
            password: 'password',
         },
      };
      axios
         .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/token`, transformData, options)
         .then((response) => {
            const { redirect_to, access_token } = response.data;
            setCookie(null, 'token', access_token, { maxAge: 2147483647 });
            setCookie(null, 'redirect_to', redirect_to, { maxAge: 2147483647 });
            router.push(redirect_to);
         })
         .catch((error) => {
            dispatch(
               commonStore.actions.setErrorMessage(
                  'The username or password you entered is incorrect'
               )
            );
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
