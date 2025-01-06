import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, IconButton, Grid, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Bathtub as BathtubIcon, Weekend as WeekendIcon, DirectionsRun as DirectionsRunIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService, { Device, RadarReading } from '../services/api.service';

type TimeRange = '1h' | '6h' | '24h';

const DeviceDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [device, setDevice] = useState<Device | null>(null);
  const [reading, setReading] = useState<RadarReading | null>(null);
  const [historicalData, setHistoricalData] = useState<RadarReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');

  const loadData = async () => {
    if (!id) return;

    try {
      const [devicesData, readingsData] = await Promise.all([
        apiService.getDevices(),
        apiService.getCurrentReadings()
      ]);

      const deviceData = devicesData.find(d => d.id === id);
      if (!deviceData) {
        throw new Error('Dispositivo non trovato');
      }

      setDevice(deviceData);
      setReading(readingsData[id]);

      // Carica i dati storici
      const end = new Date();
      const start = new Date(end.getTime() - getTimeRangeInMs(timeRange));
      const history = await apiService.getDeviceHistory(id, start, end);
      
      // Ordina i dati per timestamp
      const sortedHistory = [...history].sort((a, b) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      setHistoricalData(sortedHistory);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      enqueueSnackbar('Si è verificato un errore nel caricamento dei dati', {
        variant: 'error',
        autoHideDuration: 3000
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeInMs = (range: TimeRange) => {
    switch (range) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [id, timeRange]);

  const getDeviceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'bagno':
        return <BathtubIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
      case 'camera':
        return <WeekendIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
      default:
        return <WeekendIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
    }
  };

  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newRange: TimeRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  if (loading || !device) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ mr: 2 }}
            aria-label="torna indietro"
          >
            <ArrowBackIcon />
          </IconButton>
          {getDeviceIcon(device.name)}
          <Typography variant="h4" sx={{ ml: 2 }}>
            {device.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stato del dispositivo */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Stato Dispositivo
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DirectionsRunIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      Attività: {reading?.activitySeconds || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FavoriteIcon sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="body1">
                      Respirazione: {reading?.breathSeconds || 0} bpm
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Grafici */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Storico Attività
                </Typography>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={handleTimeRangeChange}
                  size="small"
                >
                  <ToggleButton value="1h">1h</ToggleButton>
                  <ToggleButton value="6h">6h</ToggleButton>
                  <ToggleButton value="24h">24h</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box sx={{ height: 400, mb: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value, name) => [value, name === 'activitySeconds' ? 'Attività' : 'Respirazione']}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="activitySeconds"
                      name="Attività"
                      stroke="#1976d2"
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="breathSeconds"
                      name="Respirazione"
                      stroke="#dc004e"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DeviceDetailScreen;
