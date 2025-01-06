import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import useDeviceData from '../hooks/useDeviceData';
import { useDeviceHistory } from '../hooks/useDeviceData';
import ActivityChart from '../components/ActivityChart';

const timeRanges = [
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: 'OGGI', value: 'today' }
];

const RoomDetailScreen = () => {
  const { roomId } = useParams();
  const [timeRange, setTimeRange] = useState('1h');
  const { data: deviceData, loading: deviceLoading, error: deviceError } = useDeviceData(roomId);
  const { data: historyData, loading: historyLoading, error: historyError } = useDeviceHistory({
    deviceId: roomId,
    start: getStartTime(timeRange),
    end: new Date().toISOString()
  });

  if (deviceLoading || historyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (deviceError || historyError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          {deviceError || historyError}
        </Alert>
      </Container>
    );
  }

  const currentDevice = deviceData?.[0];
  if (!currentDevice) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">
          Dispositivo non trovato
        </Alert>
      </Container>
    );
  }

  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newRange: string) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {getRoomName(currentDevice.reading.sname.S)}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stato Attuale
              </Typography>
              <Typography>
                Attività: {currentDevice.reading.Activity.M.activity.M.all.L[0].N} secondi
              </Typography>
              <Typography>
                Respiro: {currentDevice.reading.Activity.M.activity.M.breath.L[0].N} secondi
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Attività nel Tempo
                </Typography>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={handleTimeRangeChange}
                  size="small"
                >
                  {timeRanges.map((range) => (
                    <ToggleButton key={range.value} value={range.value}>
                      {range.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <ActivityChart data={historyData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

function getRoomName(deviceId: string) {
  if (deviceId.includes('BATH')) return 'Bagno';
  return 'Soggiorno';
}

function getStartTime(range: string): string {
  const now = new Date();
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    default:
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  }
}

export default RoomDetailScreen;
