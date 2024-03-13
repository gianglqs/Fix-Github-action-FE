import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';

import { AppDialog } from '../AppDialog/AppDialog';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';

import FormControlledTextField from '@/components/FormController/TextField';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';

const DialogChangePassword: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   const dispatch = useDispatch();
   const { t } = useTranslation();
   const [loading, setLoading] = useState(false);

   const updateInformationForm = useForm({
      shouldUnregister: false,
      defaultValues: detail,
   });

   const handleSubmitForm = updateInformationForm.handleSubmit(async (data: any) => {
      if (data.newPassword) {
         if (data.newPassword != data.confirmNewPassword) {
            dispatch(commonStore.actions.setErrorMessage('Confirmed password does not match'));
            return;
         }
      }

      const cookies = parseCookies();
      const token = cookies['token'];

      let formData = new FormData();
      formData.append('oldPassword', data.oldPassword);
      formData.append('newPassword', data.newPassword);

      axios({
         method: 'post',
         url: `${process.env.NEXT_PUBLIC_BACKEND_URL}users/changePassword`,
         data: formData,
         headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
         },
      })
         .then((response) => {
            dispatch(commonStore.actions.setSuccessMessage(response.data));
            onClose();
         })
         .catch((response) => {
            dispatch(commonStore.actions.setErrorMessage(response.response.data.message));
         });
   });

   useEffect(() => {
      updateInformationForm.reset(detail);
   }, [detail]);

   return (
      <AppDialog
         open={open}
         loading={loading}
         onOk={handleSubmitForm}
         onClose={onClose}
         title={t('user.changePassword')}
         okText={t('button.save')}
         closeText={t('button.close')}
      >
         <Grid container sx={{ paddingTop: 0.8, paddingBottom: 0.8 }} spacing={2}>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={updateInformationForm.control}
                  type="password"
                  name="oldPassword"
                  label={t('user.oldPassword')}
                  required
               />
            </Grid>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={updateInformationForm.control}
                  type="password"
                  name="newPassword"
                  label={t('user.newPassword')}
                  required
               />
            </Grid>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={updateInformationForm.control}
                  type="password"
                  name="confirmNewPassword"
                  label={t('user.confirmNewPassword')}
                  required
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogChangePassword };
