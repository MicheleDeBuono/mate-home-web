/**
 * Converte una stringa di intervallo temporale in millisecondi
 * @param range - Stringa che rappresenta l'intervallo ('1h', '6h', '24h')
 * @returns Numero di millisecondi corrispondenti all'intervallo
 */
export const getTimeRangeInMs = (range: string): number => {
  switch (range) {
    case '1h': return 60 * 60 * 1000;      // 1 ora
    case '6h': return 6 * 60 * 60 * 1000;  // 6 ore
    case '24h': return 24 * 60 * 60 * 1000; // 24 ore
    default: return 60 * 60 * 1000;        // default 1 ora
  }
};

/**
 * Formatta un timestamp in una stringa leggibile
 * @param timestamp - Data da formattare
 * @returns Stringa formattata HH:mm:ss
 */
export const formatTimestamp = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
