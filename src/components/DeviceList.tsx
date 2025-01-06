import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
  Tooltip,
  Chip,
  ListItemButton
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WifiIcon from '@mui/icons-material/Wifi';
import ErrorIcon from '@mui/icons-material/Error';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  battery: number;
  charging: boolean;
  signalStrength: number;
  lastUpdate: string;
}

interface Props {
  devices: Device[];
  onDeviceClick?: (deviceId: string) => void;
}

const DeviceList: React.FC<Props> = ({ devices, onDeviceClick }) => {
  const getStatusColor = (status: string) => {
    return status === 'online' ? '#4caf50' : '#f44336';
  };

  const getBatteryIcon = (battery: number, charging: boolean) => {
    if (charging) {
      return <BatteryChargingFullIcon color="primary" />;
    }
    return <BatteryFullIcon color={battery < 20 ? 'error' : 'primary'} />;
  };

  const getSignalIcon = (strength: number) => {
    if (strength > 80) return <WifiIcon color="primary" />;
    if (strength > 50) return <WifiIcon color="action" />;
    if (strength > 20) return <WifiIcon color="warning" />;
    return <WifiIcon color="error" />;
  };

  return (
    <Paper elevation={2}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          Dispositivi
        </Typography>
      </Box>
      <List>
        {devices.map((device) => (
          <ListItem
            key={device.id}
            disablePadding
          >
            <ListItemButton
              onClick={() => onDeviceClick?.(device.id)}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                <DevicesIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="span">
                    {device.name}
                  </Typography>
                }
                secondary={
                  <div>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="span">
                          Ultimo aggiornamento: {format(new Date(device.lastUpdate), 'HH:mm:ss', { locale: it })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={device.status}
                          sx={{
                            backgroundColor: getStatusColor(device.status),
                            color: 'white',
                            mr: 1
                          }}
                        />
                      </Box>
                    </Box>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title={`Batteria: ${device.battery}%`}>
                  <IconButton edge="end" sx={{ mr: 1 }}>
                    {getBatteryIcon(device.battery, device.charging)}
                  </IconButton>
                </Tooltip>
                <Tooltip title={`Segnale: ${device.signalStrength}%`}>
                  <IconButton edge="end">
                    {getSignalIcon(device.signalStrength)}
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DeviceList;
