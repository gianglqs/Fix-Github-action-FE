import { red } from '@mui/material/colors';
import { secondaryColor } from './palette';

import type { Components } from '@mui/material';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/lab/themeAugmentation';

const components: Components = {
   MuiButton: {
      defaultProps: {
         size: 'small',
         disableElevation: true,
      },
      styleOverrides: {
         root: {
            textTransform: 'capitalize',
         },
      },
   },
   MuiCheckbox: {
      defaultProps: {
         size: 'small',
         color: 'primary',
      },
   },
   MuiTextField: {
      defaultProps: {
         size: 'small',
         variant: 'outlined',
         fullWidth: true,
      },
      styleOverrides: {
         root: {
            '& input': {
               padding: '5px 8px !important',
               height: 14,
            },
         },
      },
   },
   MuiInputLabel: {
      styleOverrides: {
         root: {
            fontSize: 12,
            transform: 'translate(14px, 2px) scale(1)',
         },
         shrink: {
            transform: 'translate(14px, -9px) scale(0.8)',

            '& legend': {
               padding: 5,
            },
         },
      },
   },
   MuiIconButton: {
      styleOverrides: {
         root: {
            marginRight: '0px !important',
         },
      },
   },
   MuiTabs: {
      styleOverrides: {
         root: {
            minHeight: '38px !important',
            marginBottom: '12px !important',
         },
      },
   },
   MuiTab: {
      styleOverrides: {
         root: {
            minHeight: '32px !important',
            padding: '0 8px !important',
         },
      },
   },
   MuiInputBase: {
      styleOverrides: {
         multiline: {
            padding: '4px 8px !important',
         },
         adornedEnd: {
            paddingRight: '0 !important',
         },
      },
   },
   MuiOutlinedInput: {
      styleOverrides: {
         notchedOutline: {
            borderColor: '#e7a800',
         },
      },
   },
   MuiTooltip: {
      defaultProps: {
         arrow: true,
      },
   },
   MuiFormLabel: {
      styleOverrides: {
         asterisk: {
            color: red[500],
         },
      },
   },
   MuiFormControl: {
      styleOverrides: {},
   },
   MuiChip: {
      defaultProps: {
         size: 'small',
      },
   },
   MuiSvgIcon: {
      defaultProps: {
         fontSize: 'small',
      },
      styleOverrides: {
         root: {
            fontSize: '1.115rem',
            cursor: 'pointer !important',
         },
      },
   },
   MuiAutocomplete: {
      defaultProps: {
         openOnFocus: false,
      },
      styleOverrides: {
         inputRoot: {
            padding: '0 !important',
         },
         popupIndicator: {
            height: 26,
            padding: '0 !important',
         },
      },
   },
   MuiDialog: {
      styleOverrides: {
         paperWidthSm: {
            width: 550,
         },
      },
   },
   MuiDialogTitle: {
      styleOverrides: {
         root: {
            padding: '8px 16px',
         },
      },
   },
   MuiDialogActions: {
      styleOverrides: {
         root: {
            padding: '4px',
         },
      },
   },
   MuiSkeleton: {
      styleOverrides: {
         root: {
            backgroundColor: secondaryColor.light,
         },
      },
   },
   MuiDataGrid: {
      styleOverrides: {
         root: {
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
               borderBottom: 'none',
               backgroundColor: secondaryColor.main,
               color: '#606F89',
               fontWeight: 'bold',
               lineHeight: '1.5rem',
            },
            '& .MuiDataGrid-row': {
               '&:hover': {
                  backgroundColor: `${secondaryColor.light} !important`,
               },
               '&.Mui-selected': {
                  backgroundColor: `${secondaryColor.light} !important`,
               },
            },
            '& .MuiDataGrid-row:nth-child(odd)': {
               backgroundColor: '#ffffff',
            },
            '& .MuiDataGrid-row:nth-child(even)': {
               backgroundColor: secondaryColor.main,
            },
            '& .MuiDataGrid-cell': {
               border: '1px solid white',
               color: secondaryColor.contrastText,
               '&:focus-within': {
                  outline: 'none',
               },
            },
            '& .highlight-cell': {
               backgroundColor: 'rgba(232, 192, 86, 0.8)',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
               fontWeight: 'bold',
            },
            '& .MuiDataGrid-columnHeaderDraggableContainer': {
               '& .MuiDataGrid-menuIcon': {
                  visibility: 'visible !important',
                  width: 'auto',
               },
            },
         },
      },
   },
   MuiTreeItem: {
      styleOverrides: {
         content: {
            '&.Mui-focused': {
               backgroundColor: 'white',
            },
            '&:hover': {
               backgroundColor: 'white',
            },
         },
      },
   },
};

export default components;
