import { makeStyles } from '@mui/styles';

export default makeStyles((theme) => ({
   searchBar__container: {
      display: 'flex',
      alignItems: 'center',
   },
   searchBar__form: {
      display: 'flex',
      alignItems: 'center',
      padding: '2px 4px',
      height: 40,
      border: '1px solid #e7a800',
      borderRadius: '4px',
      '&:hover': {
         borderColor: 'black',
      },
   },
   searchBar__input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: '#000',
   },
   searchBar__searchIcon: {
      padding: 10,
      color: theme.palette.secondary.dark,
      '& svg': {
         fontSize: 25,
      },
   },
   searchBar__filterIcon: {
      fontSize: '1.5rem',
      // color: theme.palette.primary.main
      marginRight: theme.spacing(0.5),
   },
   searchBar__badge__container: {
      marginRight: theme.spacing(0.5),
      padding: theme.spacing(1.2, 1.5),
      borderRadius: 3,
      // fontWeight: 'bold',
      backgroundColor: theme.palette.secondary.dark,
      color: 'white',
      fontSize: '1rem',
      '&:hover': {
         backgroundColor: theme.palette.secondary.dark,
      },
   },
   searchBar__badge: {
      marginLeft: theme.spacing(1),
      borderRadius: '50%',
      width: 20,
      height: 20,
      backgroundColor: theme.palette.secondary.dark,
      // backgroundColor: theme.palette.info.light,
      border: '1px solid white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
   },
   searchBar__disabled: {
      color: theme.palette.action.disabled,
   },
}));
