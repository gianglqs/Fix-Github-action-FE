import { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';

import { AppDialog } from '../AppDialog/AppDialog';

import FormControlledTextField from '@/components/FormController/TextField';
import FormControllerAutocomplete from '@/components/FormController/Autocomplete';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dashboardApi from '@/api/dashboard.api';

import { useDispatch } from 'react-redux';
import { commonStore, dashboardStore } from '@/store/reducers';
import getValidationSchema from './validationSchema';

const DialogUpdateUser: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);

   const validationSchema = useMemo(() => getValidationSchema(), []);
   const updateUserForm = useForm({
      resolver: yupResolver(validationSchema),
      shouldUnregister: false,
      defaultValues: detail,
   });

   const handleSubmitForm = updateUserForm.handleSubmit(async (data: any) => {
      const transformData = {
         userName: data.userName,
         role: {
            id: data.role.id,
         },
         defaultLocale: data.defaultLocale,
      };

      try {
         setLoading(true);
         const { data } = await dashboardApi.updateUser(detail?.id, transformData);

         const userList = await dashboardApi.getUser({ search: '' });
         dispatch(dashboardStore.actions.setUserList(JSON.parse(userList?.data)?.userList));
         dispatch(commonStore.actions.setSuccessMessage(data));
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
         { id: 'us', description: 'ENGLISH' },
         { id: 'cn', description: 'CHINESE' },
      ],
      []
   );

   useEffect(() => {
      updateUserForm.reset(detail);
   }, [detail]);

   return (
      <AppDialog
         open={open}
         loading={loading}
         onOk={handleSubmitForm}
         onClose={onClose}
         title="User Details"
         okText="Save"
      >
         <Grid container sx={{ paddingTop: 0.8, paddingBottom: 0.8 }} spacing={2}>
            <Grid item xs={12}>
               <FormControlledTextField
                  control={updateUserForm.control}
                  name="name"
                  label="Name"
                  required
               />
            </Grid>

            <Grid item xs={6}>
               <FormControllerAutocomplete
                  control={updateUserForm.control}
                  name="role"
                  label="User Role"
                  disabled
                  renderOption={(prop, option) => `${option?.roleName}`}
                  getOptionLabel={(option) => `${option?.roleName}`}
                  required
                  options={roleOptions}
               />
            </Grid>
            <Grid item xs={6}>
               <FormControllerAutocomplete
                  control={updateUserForm.control}
                  name="defaultLocale"
                  label="Language"
                  required
                  options={languageOptions}
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogUpdateUser };
