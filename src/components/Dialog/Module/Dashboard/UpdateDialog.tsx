import { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';

import { AppDialog } from '../AppDialog/AppDialog';

import FormControlledTextField from '@/components/FormController/TextField';
import FormControllerAutocomplete from '@/components/FormController/Autocomplete';
import { useForm } from 'react-hook-form';
import dashboardApi from '@/api/dashboard.api';

import { useDispatch } from 'react-redux';
import { commonStore, userStore } from '@/store/reducers';
import { useTranslation } from 'react-i18next';
import { parseCookies, setCookie } from 'nookies';

const DialogUpdateUser: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   let cookies = parseCookies();
   let openerRole = cookies['role'];
   let userId = cookies['id'];

   const dispatch = useDispatch();
   const { t, i18n } = useTranslation();
   const [loading, setLoading] = useState(false);

   const updateUserForm = useForm({
      shouldUnregister: false,
      defaultValues: detail,
   });

   const [role, setRole] = useState();
   const onChooseRole = (value) => {
      setRole(value);
   };

   const handleSubmitForm = updateUserForm.handleSubmit(async (formData: any) => {
      if (formData.name === '') {
         dispatch(commonStore.actions.setErrorMessage('Username must be at least 2 characters'));
         return;
      }

      const transformData = {
         name: formData.name,
         role: role,
         defaultLocale: formData.defaultLocale,
      };

      try {
         setLoading(true);
         const { data } = await dashboardApi.updateUser(detail?.id, transformData);

         if (userId != detail?.id) {
            const userList = await dashboardApi.getUser({ search: '' });
            dispatch(userStore.actions.setUserList(JSON.parse(userList?.data)?.userList));
         }
         dispatch(commonStore.actions.setSuccessMessage(data));

         if (userId == detail?.id) {
            i18n.changeLanguage(formData.defaultLocale);
            setCookie(null, 'defaultLocale', formData.defaultLocale, { maxAge: 604800, path: '/' });
         }
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
      updateUserForm.reset(detail);
      setRole(detail.role);
   }, [detail]);

   return (
      <AppDialog
         open={open}
         loading={loading}
         onOk={handleSubmitForm}
         onClose={onClose}
         title={t('user.userDetails')}
         okText={t('button.save')}
         closeText={t('button.close')}
      >
         <Grid container sx={{ paddingTop: 0.8, paddingBottom: 0.8 }} spacing={3}>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={updateUserForm.control}
                  name="name"
                  label={t('user.name')}
                  required
               />
            </Grid>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={updateUserForm.control}
                  name="email"
                  label={t('user.email')}
                  disabled
               />
            </Grid>

            <Grid item xs={6}>
               <FormControllerAutocomplete
                  control={updateUserForm.control}
                  name="role"
                  label={t('user.role')}
                  renderOption={(prop, option) => `${option?.roleName}`}
                  getOptionLabel={(option) => `${option?.roleName}`}
                  required
                  options={roleOptions}
                  onChange={(value) => onChooseRole(value)}
                  disabled={userId == detail?.id ? true : false}
               />
            </Grid>
            <Grid item xs={6}>
               <FormControllerAutocomplete
                  control={updateUserForm.control}
                  name="defaultLocale"
                  label={t('user.language')}
                  required
                  options={languageOptions}
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogUpdateUser };
