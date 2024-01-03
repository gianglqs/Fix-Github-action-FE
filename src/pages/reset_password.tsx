import { styled, Paper, CssBaseline, Button } from '@mui/material';

import NextHead from 'next/head';
import { LoadingButton } from '@mui/lab';
import authApi from '@/api/auth.api';
import { useForm } from 'react-hook-form';
import FormControlledTextField from '@/components/FormController/TextField';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppFooter } from '@/components';
import Image from 'next/image';
import { useRouter } from 'next/router';

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
   });

   const resetPasswordForm = useForm({
      resolver: yupResolver(validationSchema),
      // shouldUnregister: false,
   });

   const dispatch = useDispatch();

   const handleResetPassword = resetPasswordForm.handleSubmit(async (formData: any) => {
      try {
         const transformData = {
            email: formData?.email,
         };
         await authApi.resetPassword(transformData);
         dispatch(commonStore.actions.setSuccessMessage('Reset Password Successfully'));
         router.push('/login');
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
      }
   });

   return (
      <>
         <NextHead>
            <title>HysterYale - Sign in</title>
         </NextHead>
         <CssBaseline />
         <StyledContainer className="center-element">
            <StyledFormContainer>
               <Image src={logo} width={250} height={40} alt="Hyster-Yale" />
               <form onSubmit={handleResetPassword}>
                  <FormControlledTextField
                     control={resetPasswordForm.control}
                     sx={{ mt: 2 }}
                     label="Email"
                     name="email"
                  />

                  <LoadingButton
                     sx={{ mt: 2 }}
                     loadingPosition="start"
                     type="submit"
                     fullWidth
                     variant="contained"
                     color="primary"
                  >
                     Reset Password
                  </LoadingButton>
               </form>
            </StyledFormContainer>
         </StyledContainer>
         <AppFooter />
      </>
   );
}
