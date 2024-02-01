import { Button, Grid, Typography } from '@mui/material';
import LineChart from '../chart/Line';
import _ from 'lodash';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const CurrencyReport: React.FC<any> = (props) => {
   const { chartData, currentCurrency, closeAReportItem } = props;

   const chartScales = {
      y1: {
         title: {
            text: 'JPY',
            display: true,
         },
         position: 'right',
      },
      y: {
         beginAtZero: true,
         title: {
            text: '',
            display: true,
         },
      },
      x: {
         title: {
            text: '',
            display: true,
         },
      },
   };

   const handleCloseItem = (item) => {
      closeAReportItem(item.target.id);
   };

   const reportContent = () => {
      const otherOptions = _.keysIn(chartData);
      const content = _.map(otherOptions, (index) => (
         <Grid
            container
            sx={{
               justifyContent: 'left',
               marginTop: 1,
               marginBottom: 1,
               marginLeft: 2,
               marginRight: 2,
               border: '0.5 px solid black',
               borderRadius: 5,
               boxShadow: 5,
            }}
         >
            <Button
               id={index}
               variant="contained"
               sx={{ width: 20, height: 20, margin: 1 }}
               onClick={(item) => handleCloseItem(item)}
            >
               Close
            </Button>
            <Grid
               item
               sx={{
                  width: '70vh',
                  height: '40vh',
                  margin: 'auto',
                  position: 'relative',
               }}
            >
               <LineChart
                  chartData={chartData[index].data}
                  chartName={chartData[index].title}
                  scales={chartScales}
               />
            </Grid>
            <Grid
               item
               sx={{
                  width: '40vh',
                  height: 'fit-content',
                  marginTop: 5,
                  margin: 'auto',
               }}
            >
               <Typography fontSize={16}>{currentCurrency} is weakening against</Typography>{' '}
               <ul>
                  {_.map(chartData[index].conclusion.weakening, (item) => (
                     <li>
                        <Typography fontSize={14}>{item}</Typography>
                     </li>
                  ))}
               </ul>
               <Typography fontSize={16}>{currentCurrency} is stable against</Typography>{' '}
               <ul>
                  {_.map(chartData[index].conclusion.stable, (item) => (
                     <li>
                        {' '}
                        <Typography fontSize={14}>{item}</Typography>
                     </li>
                  ))}
               </ul>
               <Typography fontSize={16}>{currentCurrency} is strengthening against</Typography>{' '}
               <ul>
                  {_.map(chartData[index].conclusion.strengthening, (item) => (
                     <li>
                        {' '}
                        <Typography fontSize={14}>{item}</Typography>
                     </li>
                  ))}
               </ul>
            </Grid>
         </Grid>
      ));
      return (
         <Grid
            container
            sx={{
               height: '80vh',
               overflowY: 'scroll',
               boxShadow: 5,
               borderRadius: 5,
               marginTop: 1,
               marginLeft: 2,
               marginRight: 2,
            }}
         >
            {content}
         </Grid>
      );
   };

   return <>{reportContent()}</>;
};

export { CurrencyReport };
