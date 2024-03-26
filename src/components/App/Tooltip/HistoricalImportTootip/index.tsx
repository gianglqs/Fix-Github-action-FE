import { Button, Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { PartImage } from '../../Image/PartImage';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { importFailureStore } from '@/store/reducers';
import { extractTextInParentheses } from '@/utils/getString';
import { useTranslation } from 'react-i18next';

export default function HistoricalImportTooltip(props) {
   const { t } = useTranslation();
   const { fileUUID, success, message, loading } = props;

   const dispatch = useDispatch();

   const onClick = () => {
      if (success) {
         dispatch(
            importFailureStore.actions.setDataFilter({
               fileUUID: fileUUID,
            })
         );
         dispatch(importFailureStore.actions.setImportFailureDialogState({ open: true }));
         dispatch(importFailureStore.sagaGetList());
      }
   };

   return (
      <Tooltip title={!success && message} placement="top" arrow>
         {!loading && (
            <Button variant="outlined" color={`${success ? 'success' : 'error'}`} onClick={onClick}>
               {success ? t('complete') : t('failure')}
            </Button>
         )}
      </Tooltip>
   );
}
