import { Button, Grid, Typography } from '@mui/material';
import LineChart from '../chart/Line';
import _ from 'lodash';
import React, { useRef } from 'react';

const CurrencyReport: React.FC<any> = (props) => {
   const { chartData, currentCurrency, closeAReportItem, scrollToLast, itemRef } = props;

   const handleCloseItem = (item) => {
      closeAReportItem(item.target.id);
   };

   const reportContent = () => {
      const otherOptions = _.keysIn(chartData);
      console.log(chartData);
      const content = _.map(otherOptions, (index) => {
         let chartItemScales = {
            y1: {
               title: {
                  text: 'JPY',
                  display: true,
               },
               position: 'right',
               grid: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
               },
               display: false,
            },
            y: {
               beginAtZero: true,
            },
            x: {
               title: {
                  text: '',
                  display: true,
               },
            },
         };

         if (chartData[index].title.includes('JPY')) {
            chartItemScales.y1.display = true;
         }

         return (
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
                     scales={chartItemScales}
                  />
               </Grid>
               <Grid
                  item
                  sx={{
                     width: '50vh',
                     height: 'fit-content',
                     marginTop: 5,
                     margin: 'auto',
                  }}
               >
                  <ul>
                     {chartData[index].conclusion.weakening.length > 0 ? (
                        <li>
                           <Typography fontSize={16}>
                              {currentCurrency} is weakening against
                           </Typography>{' '}
                           <ul>
                              {_.map(chartData[index].conclusion.weakening, (item) => (
                                 <li>
                                    <Typography fontSize={14}>{item}</Typography>
                                 </li>
                              ))}
                           </ul>
                        </li>
                     ) : (
                        ''
                     )}

                     {chartData[index].conclusion.stable.length > 0 ? (
                        <li>
                           <Typography fontSize={16}>
                              {currentCurrency} is stable against{' '}
                              {_.map(
                                 chartData[index].conclusion.stable,
                                 (item, i) => `${i != '0' ? ', ' : ' '}${item}`
                              )}
                           </Typography>{' '}
                        </li>
                     ) : (
                        ''
                     )}

                     {chartData[index].conclusion.strengthening.length > 0 ? (
                        <li>
                           <Typography fontSize={16}>
                              {currentCurrency} is strengthening against
                           </Typography>{' '}
                           <ul>
                              {_.map(chartData[index].conclusion.strengthening, (item) => (
                                 <li>
                                    {' '}
                                    <Typography fontSize={14}>{item}</Typography>
                                 </li>
                              ))}
                           </ul>
                        </li>
                     ) : (
                        ''
                     )}
                  </ul>
               </Grid>
            </Grid>
         );
      });

      return (
         <Grid
            container
            sx={{
               height: '80vh',
               overflowY: 'scroll',
            }}
            ref={itemRef}
         >
            {content}
         </Grid>
      );
   };
   return <>{reportContent()}</>;
};

export { CurrencyReport };
