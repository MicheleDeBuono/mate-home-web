import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import {
  Bathtub as BathtubIcon,
  Weekend as WeekendIcon,
  DirectionsRun as DirectionsRunIcon,
  Favorite as FavoriteIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Device, RadarReading } from '../services/api.service';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DeviceCardProps {
  device: Device;
  reading: RadarReading | null;
}

const getActivityColor = (activity: number) => {
  if (activity > 50) return '#f44336'; // rosso per attività intensa
  if (activity > 20) return '#ff9800'; // arancione per attività moderata
  return '#4caf50'; // verde per attività bassa
};

const getDeviceIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'bagno':
      return <BathtubIcon sx={{ fontSize: 40 }} />;
    case 'soggiorno':
      return <WeekendIcon sx={{ fontSize: 40 }} />;
    default:
      return <WeekendIcon sx={{ fontSize: 40 }} />;
  }
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, reading }) => {
  const activity = reading?.activitySeconds || 0;
  const breath = reading?.breathSeconds || 0;
  const lastUpdate = reading?.time || device.lastUpdate;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            sx={{
              mr: 2,
              backgroundColor: getActivityColor(activity),
              color: 'white',
              '&:hover': {
                backgroundColor: getActivityColor(activity)
              }
            }}
          >
            {getDeviceIcon(device.name)}
          </IconButton>
          <Box>
            <Typography variant="h6" component="div">
              {device.name}
            </Typography>
            <Chip
              label={device.status}
              color={device.status === 'ONLINE' ? 'success' : 'error'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DirectionsRunIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              Attività: {Math.round(activity)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FavoriteIcon sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="body1">
              Respiro: {Math.round(breath)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Ultimo aggiornamento: {format(new Date(lastUpdate), 'HH:mm:ss', { locale: it })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
