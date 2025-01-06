import { useState, useEffect } from 'react';
import apiService from '../services/api.service';

interface DeviceReading {
  sname: { S: string };
  ts: { S: string };
  Activity: {
    M: {
      activity: {
        M: {
          all: { L: [{ N: string }] };
          breath: { L: [{ N: string }] };
        }
      }
    }
  };
  deviceInfo?: {
    M: {
      battery: { N: string };
      charging: { BOOL: boolean };
      signalStrength: { N: string };
      status: { S: string };
      lastHeartbeat: { S: string };
    }
  };
}

interface HistoricalReading {
  time: string;
  deviceId: string;
  activitySeconds: number;
  breathSeconds: number;
}

interface HistoryOptions {
  deviceId?: string;
  start: string;
  end: string;
  window?: string;
}

export const useDeviceData = (deviceId?: string) => {
  const [data, setData] = useState<DeviceReading[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('useDeviceData: Fetching data for deviceId:', deviceId);
        const result = await apiService.getDeviceReadings(deviceId);
        console.log('useDeviceData: Received data:', result);
        setData(prevData => {
          if (!prevData.length || !result.length) return result;
          const prevReading = prevData[0]?.reading?.Activity?.M?.activity?.M;
          const newReading = result[0]?.reading?.Activity?.M?.activity?.M;
          if (!prevReading || !newReading) return result;
          
          const prevActivity = prevReading.all?.L?.[0]?.N;
          const prevBreath = prevReading.breath?.L?.[0]?.N;
          const newActivity = newReading.all?.L?.[0]?.N;
          const newBreath = newReading.breath?.L?.[0]?.N;
          
          if (prevActivity !== newActivity || prevBreath !== newBreath) {
            return result;
          }
          return prevData;
        });
        setError(null);
      } catch (err) {
        console.error('useDeviceData: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch device data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [deviceId]);

  return { data, error, loading };
};

export const useDeviceHistory = (options: HistoryOptions) => {
  const [data, setData] = useState<HistoricalReading[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    console.log('useDeviceHistory: Effect triggered with options:', options);
    
    const fetchData = async () => {
      // Throttle: aggiorna solo se sono passati almeno 30 secondi dall'ultimo aggiornamento
      const now = Date.now();
      if (now - lastFetchTime < 30000) {
        console.log('useDeviceHistory: Skipping fetch due to throttle');
        return;
      }

      if (!options.deviceId) {
        console.log('useDeviceHistory: No deviceId provided');
        setError('Device ID is required');
        setLoading(false);
        return;
      }

      try {
        console.log('useDeviceHistory: Fetching history data with options:', options);
        const startDate = new Date(options.start);
        const endDate = new Date(options.end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format. Please provide dates in ISO format.');
        }

        const result = await apiService.getDeviceHistory(
          options.deviceId,
          startDate,
          endDate,
          options.window || '1h'
        );
        console.log('useDeviceHistory: Received history data:', result);

        setData(result);
        setLastFetchTime(now);
        setError(null);
      } catch (err) {
        console.error('useDeviceHistory: Error fetching history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch history data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [options.deviceId, options.start, options.end, options.window, lastFetchTime]);

  return { data, error, loading };
};

// Esporta le interfacce per l'uso in altri file
export type { DeviceReading, HistoricalReading, HistoryOptions };
