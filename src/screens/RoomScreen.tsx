import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DirectionsRun as DirectionsRunIcon,
  Favorite as FavoriteIcon,
  Bathtub as BathtubIcon,
  Weekend as WeekendIcon
} from '@mui/icons-material';
import { format, subHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useDeviceData, useDeviceHistory } from '../hooks/useDeviceData';
import { getTimeRangeInMs } from '../utils/time';

const RoomScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('1h');

  // Create dates in UTC to avoid timezone issues
  const endDate = new Date();
  const startDate = subHours(endDate, timeRange === '24h' ? 24 : timeRange === '6h' ? 6 : 1);
  
  // Format dates in ISO format with UTC timezone
  const end = endDate.toISOString();
  const start = startDate.toISOString();

  console.log('RoomScreen - Time range:', { 
    timeRange, 
    start, 
    end,
    startDate: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
    endDate: format(endDate, 'yyyy-MM-dd HH:mm:ss')
  });

  const { data: currentData, error: currentError, loading: currentLoading } = useDeviceData(id);
  const currentReading = currentData?.[id];
  if (!currentReading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Nessun dato disponibile</Alert>
      </Container>
    );
  }

  const activity = currentReading.activitySeconds;
  const breath = currentReading.breathSeconds;
  const timestamp = new Date(currentReading.time);

  const { data: historyData, error: historyError, loading: historyLoading } = useDeviceHistory({
    deviceId: id,
    start,
    end,
    window: timeRange
  });

  console.log('RoomScreen - History data:', { 
    dataLength: historyData?.length,
    firstItem: historyData?.[0],
    lastItem: historyData?.[historyData?.length - 1]
  });

  // Validate and transform the data for the chart
  const chartData = historyData?.map(item => {
    if (!item || typeof item !== 'object') {
      console.error('Invalid data item:', item);
      return null;
    }

    // Ensure all required fields are present and valid
    if (!item.time || 
        !Number.isFinite(item.activitySeconds) || 
        !Number.isFinite(item.breathSeconds)) {
      console.error('Missing or invalid data fields:', item);
      return null;
    }

    try {
      const date = new Date(item.time);
      if (isNaN(date.getTime())) {
        console.error('Invalid date in item:', item);
        return null;
      }

      // Ensure values are non-negative
      const activitySeconds = Math.max(0, item.activitySeconds);
      const breathSeconds = Math.max(0, item.breathSeconds);

      return {
        ...item,
        timestamp: date.getTime(),
        activitySeconds,
        breathSeconds
      };
    } catch (err) {
      console.error('Error processing data item:', err, item);
      return null;
    }
  }).filter(Boolean);

  console.log('RoomScreen - Chart data:', {
    originalLength: historyData?.length,
    chartDataLength: chartData?.length,
    sampleData: chartData?.slice(0, 3)
  });

  if (!id) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">ID dispositivo non valido</Alert>
      </Container>
    );
  }

  if (currentLoading || historyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentError || historyError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{currentError || historyError}</Alert>
      </Container>
    );
  }

  const getDeviceIcon = () => {
    if (id.includes('BATH')) return <BathtubIcon sx={{ fontSize: 40 }} />;
    return <WeekendIcon sx={{ fontSize: 40 }} />;
  };

  const getDeviceName = () => {
    if (id.includes('BATH')) return 'Bagno';
    return 'Soggiorno';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" display="inline">
          {getDeviceName()}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
              <IconButton sx={{ mr: 2, backgroundColor: '#f5f5f5' }}>
                {getDeviceIcon()}
              </IconButton>
              <Typography variant="h6" component="div">
                Attività Corrente
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <DirectionsRunIcon sx={{ mr: 1 }} />
                  <Typography variant="h5" component="div">
                    Attività: {activity}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <FavoriteIcon sx={{ mr: 1 }} />
                  <Typography variant="h5" component="div">
                    Respiro: {breath}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 2 }}>
          Ultimo aggiornamento: {format(timestamp, 'HH:mm:ss', { locale: it })}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Storico Attività
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => setTimeRange('1h')}
              variant={timeRange === '1h' ? 'contained' : 'outlined'}
            >
              1h
            </Button>
            <Button
              onClick={() => setTimeRange('6h')}
              variant={timeRange === '6h' ? 'contained' : 'outlined'}
            >
              6h
            </Button>
            <Button
              onClick={() => setTimeRange('24h')}
              variant={timeRange === '24h' ? 'contained' : 'outlined'}
            >
              24h
            </Button>
          </ButtonGroup>
        </Box>

        {chartData && chartData.length > 0 ? (
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart 
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm', { locale: it })}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={[0, dataMax => Math.max(1, Math.ceil(dataMax * 1.1))]}
                  tickCount={5}
                  allowDecimals={false}
                />
                <Tooltip
                  labelFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm:ss', { locale: it })}
                  formatter={(value: number) => [value.toFixed(1), '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activitySeconds"
                  name="Attività"
                  stroke={theme.palette.primary.main}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="breathSeconds"
                  name="Respirazione"
                  stroke={theme.palette.secondary.main}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {historyError ? `Errore: ${historyError}` : 'Nessun dato storico disponibile'}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default RoomScreen;
