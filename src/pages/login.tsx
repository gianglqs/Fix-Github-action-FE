import { styled, Paper, Grid, Box, Typography } from '@mui/material';
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
import { GetServerSidePropsContext } from 'next';
import { checkTokenBeforeLoadPageLogin } from '@/utils/checkTokenBeforeLoadPage';
import { useEffect, useState } from 'react';

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPageLogin(context);
}

export default function LoginPage(props) {
   const router = useRouter();
   const { imageTagFE, releaseTagFE } = props;

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
            const accessToken = response.data.data.accessToken;
            const refreshToken = response.data.data.refreshToken;
            const name = response.data.data.name;
            const role = response.data.data.role;
            const defaultLocale = response.data.data.defaultLocale;
            const userId = response.data.data.id;

            setCookie(null, 'token', accessToken, {
               maxAge: 604800,
               path: '/',
            });
            // save refresh_token in cookies
            setCookie(null, 'refresh_token', refreshToken, {
               maxAge: 604800,
               path: '/',
            });

            setCookie(null, 'role', role, { maxAge: 604800, path: '/' });
            setCookie(null, 'name', name, { maxAge: 604800, path: '/' });
            setCookie(null, 'defaultLocale', defaultLocale, { maxAge: 604800, path: '/' });
            setCookie(null, 'id', userId, { maxAge: 604800, path: '/' });

            router.push('/web-pricing-tools/admin/users');
         })
         .catch((error) => {                    
            dispatch(commonStore.actions.setErrorMessage(error.response.data.message));
         });
   });
   const [backendVersion, setBackendVersion] = useState({ imageTag: '', releaseTag: '' });

   useEffect(() => {
      axios
         .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}backend-version/version`)
         .then((response) => {
            setBackendVersion({
               imageTag: response.data.imageTag,
               releaseTag: response.data.releaseTag,
            });
         })
         .catch((error) => {
            console.log(error);
         });
   }, []);

   return (
      <>
         <NextHead>
            <title>HysterYale - Sign in</title>
         </NextHead>
         <Box
            sx={{
               position: 'absolute',
               right: '5px',
               top: '10px',
               border: '1px solid #b9d5ff99',
               padding: '10px',
            }}
         >
            <Typography sx={{ fontWeight: 900, color: '#e7a800' }}>SOFTWARE VERSION:</Typography>
            <Box>
               <Typography>Backend</Typography>
               <ul style={{ paddingLeft: 15, margin: 0 }}>
                  <li>
                     <Typography>Image Tag: {backendVersion.imageTag}</Typography>
                  </li>
                  <li>
                     <Typography>Release Tag: {backendVersion.releaseTag}</Typography>
                  </li>
               </ul>
            </Box>

            <Box>
               <Typography>Frontend</Typography>
               <ul style={{ paddingLeft: 15, margin: 0 }}>
                  <li>
                     <Typography>Image Tag: {imageTagFE}</Typography>
                  </li>
                  <li>
                     <Typography>Release Tag: {releaseTagFE}</Typography>
                  </li>
               </ul>
            </Box>
         </Box>
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
