import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';

import { AppDialog } from '../AppDialog/AppDialog';
import { useDispatch } from 'react-redux';
import { commonStore, userStore } from '@/store/reducers';

import dashboardApi from '@/api/dashboard.api';
import { useTranslation } from 'react-i18next';
import { Cookie } from '@mui/icons-material';
import { id } from 'date-fns/locale';

const DeactiveUserDialog: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;
   const [loading, setLoading] = useState(false);
   const { t } = useTranslation();

   const dispatch = useDispatch();
   const deactivateUserForm = useForm({
      defaultValues: detail,
   });

   function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
   }

   const handleDeactivateUser = deactivateUserForm.handleSubmit(async () => {
      try {
         setLoading(true);
         await dashboardApi.deactivateUser(detail.id);

         //get id from cookie
         if (getCookie('id') != detail.id) {
            const { data } = await dashboardApi.getUser({ search: '' });
            dispatch(userStore.actions.setUserList(JSON.parse(data)?.userList));
         }
         dispatch(
            commonStore.actions.setSuccessMessage(
               detail?.isActive ? 'Deactivate user successfully' : 'Activate user successfully'
            )
         );
         onClose();
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error?.message));
      } finally {
         setLoading(false);
      }
   });

   return (
      <AppDialog
         open={open}
         loading={loading}
         onOk={handleDeactivateUser}
         onClose={onClose}
         title={detail?.isActive ? `${t('user.deactivateUser')}` : `${t('user.activateUser')}`}
         okText={t('button.save')}
         closeText={t('button.close')}
      >
         <Grid container>
            {t('user.activateUserQuestion')}{' '}
            {!detail?.isActive ? `${t('user.activateUser')}` : `${t('user.deactivateUser')}`}
            {detail?.userName}?
         </Grid>
      </AppDialog>
   );
};

export { DeactiveUserDialog };
