import { Button, Grid, Typography } from '@mui/material';
import LineChart from '../chart/Line';
import _ from 'lodash';
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';

const CurrencyReport: React.FC<any> = (props) => {
   const { chartData, closeAReportItem, itemRef } = props;

   const handleCloseItem = (item) => {
      closeAReportItem(item.target.id);
   };

   const dispatch = useDispatch();

   const handleDownloadImage = async (item) => {
      const element = document.getElementById('chart-' + item.target.id),
         canvas = await html2canvas(element),
         data = canvas.toDataURL('image/jpg');

      const img = await fetch(data);
      const imgBlob = await img.blob();

      try {
         await navigator.clipboard.write([
            new ClipboardItem({
               [imgBlob.type]: imgBlob,
            }),
         ]);
         dispatch(commonStore.actions.setSuccessMessage('Copied to Clipboard'));
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage('Error on copying content'));
      }
   };

   const reportContent = () => {
      const otherOptions = _.keysIn(chartData);

      const content = _.map(otherOptions, (index) => {
         const currentCurrency = chartData[index].title.substring(0, 3);
         const tooltip = {
            interaction: {
               intersect: true,
               mode: 'nearest',
            },
            callbacks: {
               label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                     label += ': ';
                  }
                  label += `${Number(context.parsed.y.toFixed(6))}`;

                  return label;
               },
            },
         };
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
               ticks: {
                  callback: function (value) {
                     return Number(value.toFixed(6));
                  },
               },
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
                  sx={{ width: 50, height: 20, margin: 1 }}
                  onClick={(item) => handleCloseItem(item)}
               >
                  Close
               </Button>

               <Button
                  id={index}
                  variant="contained"
                  sx={{ width: 30, height: 20, margin: 1 }}
                  onClick={(item) => handleDownloadImage(item)}
               >
                  Copy
               </Button>

               <div
                  id={`chart-${index}`}
                  style={{
                     width: '80%',
                     height: '40vh',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                  }}
               >
                  <Grid
                     item
                     sx={{
                        width: '80vh',
                        height: '40vh',
                        margin: 'auto',
                     }}
                  >
                     <LineChart
                        chartData={chartData[index].data}
                        chartName={chartData[index].title}
                        scales={chartItemScales}
                        tooltip={tooltip}
                     />
                  </Grid>
                  <Grid
                     item
                     sx={{
                        width: '50vh',
                        height: 'fit-content',
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
               </div>
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
