import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, CircularProgress, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiService, { Device, RadarReading } from '../services/api.service';
import DeviceCard from '../components/DeviceCard';
import { useSnackbar } from 'notistack';

const HomeScreen: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [readings, setReadings] = useState<{ [key: string]: RadarReading }>({});
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [devicesData, readingsData] = await Promise.all([
        apiService.getDevices(),
        apiService.getCurrentReadings()
      ]);

      // Filtra solo i dispositivi del bagno e della camera principale
      const filteredDevices = devicesData.filter(device => 
        device.name.toLowerCase() === 'bagno' || device.name.toLowerCase() === 'camera'
      );

      setDevices(filteredDevices);
      setReadings(readingsData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      enqueueSnackbar('Si è verificato un errore nel caricamento dei dati', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/device/${deviceId}`);
  };

  if (loading) {
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

  // Calcola il riepilogo
  const totalActivity = devices.reduce((sum, device) => {
    const reading = readings[device.id];
    return sum + (reading?.activitySeconds || 0);
  }, 0);
  
  const averageBreath = devices.reduce((sum, device) => {
    const reading = readings[device.id];
    return sum + (reading?.breathSeconds || 0);
  }, 0) / (devices.length || 1);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Dashboard MATE HOME
        </Typography>

        {/* Riepilogo */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Riepilogo Dispositivi
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                Dispositivi Attivi: {devices.filter(d => d.status === 'ONLINE').length}/{devices.length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                Attività Totale: {Math.round(totalActivity)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                Media Respirazione: {Math.round(averageBreath)} bpm
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Dispositivi */}
        <Grid container spacing={3}>
          {devices.map((device) => (
            <Grid item xs={12} sm={6} key={device.id}>
              <div onClick={() => handleDeviceClick(device.id)} style={{ cursor: 'pointer' }}>
                <DeviceCard 
                  device={device}
                  reading={readings[device.id]}
                />
              </div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeScreen;
