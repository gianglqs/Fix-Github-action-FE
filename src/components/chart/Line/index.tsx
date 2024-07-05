import React from 'react';
import { Line } from 'react-chartjs-2';
import _, { isNil } from 'lodash';
import { forwardRef } from 'react';
const LineChart: React.FC<any> = forwardRef((props, ref: any) => {
   const { chartData, scales, chartName, tooltip, subtitle } = props;
   return (
      <Line
         ref={ref}
         data={chartData}
         options={{
            scales,
            maintainAspectRatio: false,
            plugins: {
               title: {
                  display: true,
                  text: isNil(subtitle) ? chartName : [chartName, subtitle],
               },
               legend: {
                  display: true,
               },
               tooltip,
            },
            spanGaps: true,
         }}
      />
   );
});
export default LineChart;
