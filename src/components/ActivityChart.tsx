import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Props {
  data: HistoricalReading[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 1.5, 
        border: '1px solid #ccc',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {format(new Date(label), 'HH:mm:ss')}
        </Typography>
        <Typography color="primary" variant="body2">
          Attività: {payload[0].value}
        </Typography>
        <Typography color="success.main" variant="body2">
          Respiro: {payload[1].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

const ActivityChart: React.FC<Props> = ({ data }) => {
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => format(new Date(time), 'HH:mm:ss')}
            stroke="#666"
          />
          <YAxis
            label={{ 
              value: 'Intensità del movimento (0-100)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            height={36}
            formatter={(value) => {
              return value === 'activitySeconds' ? 'Attività Generale' : 'Attività Respiratoria';
            }}
          />
          <Line
            type="monotone"
            dataKey="activitySeconds"
            stroke="#7c4dff"
            strokeWidth={2}
            dot={false}
            name="Attività Generale"
          />
          <Line
            type="monotone"
            dataKey="breathSeconds"
            stroke="#4caf50"
            strokeWidth={2}
            dot={false}
            name="Attività Respiratoria"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ActivityChart;
