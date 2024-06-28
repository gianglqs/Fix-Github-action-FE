import { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';

import { AppDialog } from '../AppDialog/AppDialog';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { commonStore, userStore } from '@/store/reducers';
import dashboardApi from '@/api/dashboard.api';
import { CreateUserFormValues } from '@/types/user';

import FormControlledTextField from '@/components/FormController/TextField';
import FormControllerAutocomplete from '@/components/FormController/Autocomplete';

import getValidationSchema from './validationSchema';
import { useTranslation } from 'react-i18next';
import { string } from 'yup';

const DialogCreateUser: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   const dispatch = useDispatch();
   const { t } = useTranslation();

   const [loading, setLoading] = useState(false);

   const validationSchema = useMemo(() => getValidationSchema(), []);
   const createForm = useForm({
      resolver: yupResolver(validationSchema),
      shouldUnregister: false,
      defaultValues: detail,
   });

   const handleSubmitForm = createForm.handleSubmit(async (data: CreateUserFormValues) => {
      const transformData = {
         name: data.userName,
         email: data.email,
         password: data.password,
         role: {
            id: data.role,
         },
         defaultLocale: data.defaultLocale,
      };
      try {
         setLoading(true);
         await dashboardApi.createUser(transformData);
         const { data } = await dashboardApi.getUser({ search: '' });
         dispatch(userStore.actions.setUserList(JSON.parse(data)?.userList));
         dispatch(commonStore.actions.setSuccessMessage(t('user.userCreatedSuccessfully')));
         onClose();
      } catch (error) {                  
         dispatch(commonStore.actions.setErrorMessage(error?.message));        
      } finally {
         setLoading(false);
      }
   });

   const roleOptions = useMemo(
      () => [
         { id: 1, roleName: 'ADMIN' },
         { id: 2, roleName: 'USER' },
      ],
      []
   );

   const languageOptions = useMemo(
      () => [
         { id: 'en', description: 'English' },
         { id: 'vn', description: 'Vietnamese' },
         { id: 'cn', description: 'Chinese' },
      ],
      []
   );

   useEffect(() => {
      createForm.reset(detail);
   }, [detail]);

   return (
      <AppDialog
         open={open}
         loading={loading}
         onOk={handleSubmitForm}
         onClose={onClose}
         title={t('user.newUser')}
         okText={t('button.save')}
         closeText={t('button.close')}
      >
         <Grid container sx={{ paddingTop: 0.8, paddingBottom: 0.8 }} spacing={2}>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={createForm.control}
                  name="userName"
                  label={t('user.name')}
                  required
               />
            </Grid>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={createForm.control}
                  name="email"
                  label={t('user.email')}
                  required
               />
            </Grid>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={createForm.control}
                  type="password"
                  name="password"
                  label={t('user.password')}
                  autoComplete="new-password"
                  required
               />
            </Grid>
            <Grid item xs={6}>
               <FormControllerAutocomplete
                  control={createForm.control}
                  name="role"
                  label={t('user.role')}
                  renderOption={(prop, option) => `${option?.roleName}`}
                  getOptionLabel={(option) => `${option?.roleName}`}
                  required
                  options={roleOptions}
               />
            </Grid>
            <Grid item xs={6}>
               <FormControllerAutocomplete 
                  control={createForm.control}
                  name="defaultLocale"
                  label={t('user.language')}
                  renderOption={(prop, option) => `${option?.description}`}
                  getOptionLabel={(option) => `${option?.description}`}
                  required
                  options={languageOptions}
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogCreateUser };
