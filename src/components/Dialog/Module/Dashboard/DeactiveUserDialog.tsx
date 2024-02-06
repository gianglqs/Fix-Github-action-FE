import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';

import { AppDialog } from '../AppDialog/AppDialog';
import { useDispatch } from 'react-redux';
import { commonStore, userStore } from '@/store/reducers';

import dashboardApi from '@/api/dashboard.api';

const DeactiveUserDialog: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch();
   const deactivateUserForm = useForm({
      defaultValues: detail,
   });

   const handleDeactivateUser = deactivateUserForm.handleSubmit(async () => {
      try {
         setLoading(true);
         await dashboardApi.deactivateUser(detail.id);
         const { data } = await dashboardApi.getUser({ search: '' });
         dispatch(userStore.actions.setUserList(JSON.parse(data)?.userList));
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
         title={detail?.isActive ? 'Deactivate User' : 'Active User'}
         okText="Accept"
         closeText="Cancel"
      >
         <Grid container>
            Are you sure you want to {!detail?.isActive ? 'activate' : 'deactivate'} user{' '}
            {detail?.userName}?
         </Grid>
      </AppDialog>
   );
};

export { DeactiveUserDialog };
