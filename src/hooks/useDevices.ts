import { useState, useEffect } from 'react';
import apiService from '../services/api.service';
import type { DeviceReading } from './useDeviceData';

interface Device {
  id: string;
  name: string;
  type: 'MAIN' | 'BATH';
  status: 'online' | 'offline';
  battery: number;
  charging: boolean;
  signalStrength: number;
  lastUpdate: string;
  activity: {
    all: number;
    breath: number;
  };
}

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await apiService.getDevices();
        setDevices(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);

    return () => clearInterval(interval);
  }, []);

  return { devices, loading, error };
};

export type { Device };
export default useDevices;

export function useDevice(id: string) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const data = await apiService.getDevice(id);
        setDevice(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching device');
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
    const interval = setInterval(fetchDevice, 5000); // Aggiorna ogni 5 secondi

    return () => clearInterval(interval);
  }, [id]);

  return { device, loading, error };
}
