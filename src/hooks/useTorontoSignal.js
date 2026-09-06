import { useEffect, useMemo, useState } from 'react';

const TORONTO = { lat: 43.6532, lon: -79.3832 };

export default function useTorontoSignal() {
  const [weather, setWeather] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${TORONTO.lat}&longitude=${TORONTO.lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=America%2FToronto`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Weather unavailable');
        const data = await res.json();
        if (!cancelled) setWeather(data.current || null);
      } catch {
        if (!cancelled) setWeather(null);
      }
    };
    load();
    const timer = setInterval(load, 10 * 60 * 1000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  return useMemo(() => {
    const time = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    const temp = weather?.temperature_2m;
    return `TORONTO / ${time}${Number.isFinite(temp) ? ` / ${Math.round(temp)}°C` : ''}`;
  }, [now, weather]);
}
