import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Device {
  id: string;
  name: string;
  type: 'RADAR';
  status: 'ONLINE' | 'OFFLINE';
  lastUpdate: string;
  lastReading?: {
    activity: {
      all: number;
      breath: number;
    };
  };
}

export interface RadarReading {
  time: string;
  deviceId: string;
  activitySeconds: number;
  breathSeconds: number;
}

export interface CurrentReading {
  deviceId: string;
  timestamp: string;
  activity: {
    all: number;
    breath: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class ApiService {
  public async getDevices(): Promise<Device[]> {
    try {
      const response = await axios.get<ApiResponse<Device[]>>(`${API_BASE_URL}/devices`);
      return response.data.data;
    } catch (error) {
      console.error('Errore nel recupero dei dispositivi:', error);
      throw error;
    }
  }

  public async getDevice(id: string): Promise<Device> {
    try {
      const response = await axios.get<ApiResponse<Device>>(`${API_BASE_URL}/devices/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Errore nel recupero del dispositivo ${id}:`, error);
      throw error;
    }
  }

  public async getCurrentReadings(): Promise<{ [key: string]: RadarReading }> {
    try {
      const response = await axios.get<ApiResponse<{ [key: string]: CurrentReading }>>(`${API_BASE_URL}/devices/readings/current`);
      
      // Transform current readings to match historical format
      const normalizedReadings: { [key: string]: RadarReading } = {};
      for (const [deviceId, reading] of Object.entries(response.data.data)) {
        normalizedReadings[deviceId] = {
          deviceId: reading.deviceId,
          time: reading.timestamp,
          activitySeconds: reading.activity.all,
          breathSeconds: reading.activity.breath
        };
      }

      console.log('Normalized current readings:', {
        original: response.data.data,
        normalized: normalizedReadings
      });

      return normalizedReadings;
    } catch (error) {
      console.error('Errore nel recupero delle letture correnti:', error);
      throw error;
    }
  }

  public async getDeviceHistory(deviceId: string, start: Date, end: Date): Promise<RadarReading[]> {
    try {
      console.log('Fetching device history:', {
        deviceId,
        start: start.toISOString(),
        end: end.toISOString()
      });

      const response = await axios.get<ApiResponse<RadarReading[]>>(`${API_BASE_URL}/history/${deviceId}`, {
        params: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      });

      console.log('Device history response:', {
        success: response.data.success,
        dataLength: response.data.data?.length,
        sampleData: response.data.data?.slice(0, 3)
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch history data');
      }

      if (!Array.isArray(response.data.data)) {
        throw new Error('Invalid response format: data is not an array');
      }

      // Validate and transform each reading
      const validatedReadings = response.data.data.map(reading => {
        if (!reading.time || typeof reading.activitySeconds !== 'number' || typeof reading.breathSeconds !== 'number') {
          console.error('Invalid reading format:', reading);
          return null;
        }

        try {
          const date = new Date(reading.time);
          if (isNaN(date.getTime())) {
            console.error('Invalid date in reading:', reading);
            return null;
          }

          return {
            ...reading,
            time: date.toISOString()
          };
        } catch (err) {
          console.error('Error processing reading:', err, reading);
          return null;
        }
      }).filter(Boolean) as RadarReading[];

      console.log('Validated readings:', {
        originalLength: response.data.data.length,
        validatedLength: validatedReadings.length,
        sampleValidated: validatedReadings.slice(0, 3)
      });

      return validatedReadings;
    } catch (error) {
      console.error(`Errore nel recupero della cronologia per il dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  public async getDailyStats(deviceId: string, date: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${deviceId}/daily`, {
        params: { date }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Errore nel recupero delle statistiche giornaliere per il dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  public async generateTestData(deviceId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/history/${deviceId}/test`);
    } catch (error) {
      console.error(`Errore nella generazione dei dati di test per il dispositivo ${deviceId}:`, error);
      throw error;
    }
  }
}

export default new ApiService();
