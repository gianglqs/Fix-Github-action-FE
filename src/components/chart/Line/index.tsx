import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart: React.FC<any> = (props) => {
   const { chartData, scales, chartName, tooltip } = props;
   return (
      <Line
         data={chartData}
         options={{
            scales,
            maintainAspectRatio: false,
            plugins: {
               title: {
                  display: true,
                  text: chartName,
               },
               legend: {
                  display: true,
               },
               tooltip,
            },
         }}
      />
   );
};
export default LineChart;
