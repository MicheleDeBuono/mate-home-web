export interface RadarReading {
  sname: {
    S: string;
  };
  ts: {
    S: string;
  };
  Activity: {
    M: {
      activity: {
        M: {
          all: {
            L: Array<{ N: string }>;
          };
          breath: {
            L: Array<{ N: string }>;
          };
        };
      };
    };
  };
  deviceInfo?: {
    M: {
      battery: {
        N: string;
      };
      charging: {
        BOOL: boolean;
      };
      signalStrength: {
        N: string;
      };
      status: {
        S: string;
      };
      lastHeartbeat: {
        S: string;
      };
    };
  };
}

export interface DeviceReading {
  reading: RadarReading;
}

export interface HistoricalReading {
  timestamp: string;
  activity: number;
  breath: number;
}

export interface DailyStats {
  date: string;
  averageActivity: number;
  maxActivity: number;
  averageBreath: number;
  maxBreath: number;
  activeHours: number;
}
