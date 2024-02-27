import { useMemo, useState, memo, useCallback, useEffect, useRef } from 'react';
import useStyles from './styles';

import { TextField, Tooltip, InputAdornment } from '@mui/material';
import { FormControllerErrorMessage, GenerateCodeIcon } from '@/components';

import clsx from 'clsx';

import type { AppTextFieldProps } from './type';

const AppTextField: React.FC<AppTextFieldProps> = (props) => {
   const {
      helperText,
      error,
      InputProps,
      disabled,
      generateCode,
      tooltip,
      loading,
      onGenerateCode,
      isFocus,
      value,
      ...textFieldProps
   } = props;

   // const classes = useStyles()
   const focusRef = useRef(null);

   const [isFocusing, setIsFocusing] = useState(false);

   const openTooltip = useMemo(() => isFocusing && error, [error, isFocusing]);

   useEffect(() => {
      if (focusRef.current) {
         focusRef.current.focus();
      }
   }, []);

   const onHoverField = () => {
      setIsFocusing(true);
   };

   const onLeavingField = () => {
      setIsFocusing(false);
   };

   // const renderGenerateIcon = useCallback(() => {
   //   if (generateCode) {
   //     return (
   //       <InputAdornment position="end" disablePointerEvents={disabled || loading}>
   //         <Tooltip title={tooltip}>
   //           <GenerateCodeIcon
   //             fontSize="inherit"
   //             className={clsx(classes.appTextField__generateIcon, {
   //               [classes.appTextField__generateIcon__disabled]: disabled || loading
   //             })}
   //             onClick={onGenerateCode}
   //           />
   //         </Tooltip>
   //       </InputAdornment>
   //     )
   //   }
   //   return null
   // }, [disabled, loading, generateCode, tooltip, onGenerateCode])

   return (
      <FormControllerErrorMessage title={helperText} open={openTooltip}>
         <TextField
            value={value}
            disabled={disabled}
            error={error}
            onMouseOver={onHoverField}
            onMouseLeave={onLeavingField}
            inputRef={isFocus && focusRef}
            InputProps={{
               readOnly: disabled,
               className: clsx({ 'Mui-disabled': disabled }),
               // endAdornment: renderGenerateIcon(),
               ...InputProps,
            }}
            {...textFieldProps}
         />
      </FormControllerErrorMessage>
   );
};

AppTextField.defaultProps = {
   generateCode: false,
   tooltip: 'Generate code',
   loading: false,
};

export default memo(AppTextField);
