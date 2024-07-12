import useStyles from './styles';

import { Paper, IconButton, InputBase } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import { useState, useImperativeHandle, forwardRef } from 'react';
export type AppSearchBarProps = {
   placeholder?: string;
   width?: number;
   onSearch(event, query): void;
   filterable?: boolean;
   disabled?: boolean;
};

const AppSearchBar = forwardRef((props: AppSearchBarProps, ref) => {
   const { placeholder, onSearch, width, disabled } = props;
   const classes = useStyles();
   const [searchQuery, setSearchQuery] = useState('');

   useImperativeHandle(ref, () => ({
      clearSearchQuery() {
         setSearchQuery('');
      },
   }));

   const handleInputQuery = (event) => {
      setSearchQuery(event.target.value);
   };

   const handleSubmitSearch = (event) => {
      event.preventDefault();
      onSearch(event, searchQuery);
   };

   return (
      <div className={classes.searchBar__container} data-testid="app-searchbar">
         <Paper
            component="form"
            elevation={0}
            className={classes.searchBar__form}
            style={{ width }}
            onSubmit={handleSubmitSearch}
         >
            <InputBase
               ref={ref}
               autoFocus
               disabled={disabled}
               className={classes.searchBar__input}
               placeholder={placeholder}
               value={searchQuery}
               onChange={handleInputQuery}
            />
            <IconButton
               type="submit"
               className={classes.searchBar__searchIcon}
               aria-label="search"
               disabled={disabled}
            >
               <SearchIcon />
            </IconButton>
         </Paper>
      </div>
   );
});

AppSearchBar.defaultProps = {
   filterable: true,
   width: 300,
   placeholder: 'Search...',
   disabled: false,
};

export { AppSearchBar };
