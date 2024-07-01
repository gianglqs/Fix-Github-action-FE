import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from '@mui/material';
import useStyles from './styles';
import clsx from 'clsx';

import { Unless, When } from 'react-if';
import Draggable from 'react-draggable';
import { enableMapSet } from 'immer';

function PaperComponent({ draggable, ...props }) {
   return (
      <>
         <When condition={draggable}>
            <Draggable
               handle=".MuiDialogTitle-root"
               cancel={'[class*="MuiDialogContent-root"]'}
               bounds="parent"
            >
               <Paper {...props} style={{ margin: 0 }} />
            </Draggable>
         </When>
         <Unless condition={draggable}>
            <Paper {...props} style={{ margin: 0 }} />
         </Unless>
      </>
   );
}

const AppDialog: React.FC<any> = (props) => {
   const {
      onOk,
      children,
      onClose,
      bodyStyles,
      id,
      draggable,
      okButtonProps,
      PaperProps,
      loading,
      title,
      okText,
      closeText,
      disableOK,
      disableClose,
      ...dialogProps
   } = props;
   const classes = useStyles(props);
   return (
      <Dialog
         className={clsx(classes.appDialog__container)}
         onClose={onClose}
         PaperComponent={PaperComponent}
         PaperProps={{ draggable, component: 'form', id, ...(PaperProps as any) }}
         {...dialogProps}
      >
         <DialogTitle className={classes.appDialog__title}>{title}</DialogTitle>
         <DialogContent className={classes.appDialog__content} style={{ ...bodyStyles }}>
            {children}
         </DialogContent>
         <DialogActions className={classes.appDialog__buttonActions}>
            <Button
               color="primary"
               autoFocus
               type="submit"
               form={id}
               disabled={loading || disableOK}
               onClick={onOk}
               {...okButtonProps}
            >
               {okText}
            </Button>
            <Button color="primary" autoFocus disabled={loading || disableClose} onClick={onClose}>
               {closeText}
            </Button>
         </DialogActions>
      </Dialog>
   );
};

AppDialog.defaultProps = {
   okText: 'ok',
   maxWidth: 'sm',
   closeText: 'close',
   type: 'normal',
   draggable: true,
   okTextHelper: null,
};

export { AppDialog };
