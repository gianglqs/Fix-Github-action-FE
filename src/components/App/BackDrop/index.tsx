import { Box, CircularProgress } from '@mui/material';

export default function AppBackDrop(props: any) {
   const { open, hightHeaderTable, bottom, left } = props;

   return (
      <Box
         sx={{
            position: 'absolute',
            top: hightHeaderTable,
            left: left ? left : '0',
            right: '0',
            bottom: bottom ? bottom : '45px',
            //  transform: 'translate(-50%, -50%)',
            display: open ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
            opacity: '0.2',
            zIndex: (theme) => theme.zIndex.drawer + 1,
         }}
      >
         <CircularProgress sx={{ color: 'white' }} />
      </Box>
   );
}
