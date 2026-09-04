// CLYD3 — Toronto live weather + time signal
// Uses Open-Meteo's public forecast API (no API key required).
(() => {
    const TORONTO = {
        latitude: 43.6532,
        longitude: -79.3832,
        timezone: 'America/Toronto'
    };

    const WEATHER_REFRESH_MS = 10 * 60 * 1000;

    const weatherLabels = {
        0: ['Clear sky', '☀'],
        1: ['Mainly clear', '◐'],
        2: ['Partly cloudy', '◑'],
        3: ['Overcast', '☁'],
        45: ['Fog', '≋'],
        48: ['Rime fog', '≋'],
        51: ['Light drizzle', '⋰'],
        53: ['Drizzle', '⋰'],
        55: ['Heavy drizzle', '⋰'],
        56: ['Freezing drizzle', '❄'],
        57: ['Freezing drizzle', '❄'],
        61: ['Light rain', '☂'],
        63: ['Rain', '☂'],
        65: ['Heavy rain', '☂'],
        66: ['Freezing rain', '❄'],
        67: ['Freezing rain', '❄'],
        71: ['Light snow', '✣'],
        73: ['Snow', '✣'],
        75: ['Heavy snow', '✣'],
        77: ['Snow grains', '✣'],
        80: ['Rain showers', '☂'],
        81: ['Rain showers', '☂'],
        82: ['Heavy showers', '☂'],
        85: ['Snow showers', '✣'],
        86: ['Heavy snow showers', '✣'],
        95: ['Thunderstorm', 'ϟ'],
        96: ['Storm + hail', 'ϟ'],
        99: ['Storm + hail', 'ϟ']
    };

    const buildWidget = () => {
        const header = document.querySelector('.site-header');
        if (!header || document.querySelector('.toronto-signal')) return null;

        const signal = document.createElement('div');
        signal.className = 'toronto-signal';
        signal.setAttribute('role', 'status');
        signal.setAttribute('aria-live', 'polite');
        signal.innerHTML = `
            <span class="toronto-signal-node" aria-hidden="true"></span>
            <div class="toronto-signal-main">
                <span class="toronto-signal-city">Toronto</span>
                <span class="toronto-signal-time" data-toronto-time>--:--</span>
            </div>
            <span class="toronto-signal-divider" aria-hidden="true"></span>
            <div class="toronto-signal-weather">
                <span class="toronto-signal-icon" data-weather-icon aria-hidden="true">·</span>
                <span class="toronto-signal-temp" data-weather-temp>--°</span>
                <span class="toronto-signal-condition" data-weather-condition>Weather link</span>
            </div>
        `;

        const status = header.querySelector('.header-status');
        if (status) header.insertBefore(signal, status);
        else header.appendChild(signal);

        return signal;
    };

    const formatTorontoTime = () => new Intl.DateTimeFormat('en-CA', {
        timeZone: TORONTO.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date());

    const updateClock = widget => {
        const time = widget?.querySelector('[data-toronto-time]');
        if (time) time.textContent = formatTorontoTime();
    };

    const updateWeather = async widget => {
        if (!widget) return;

        const tempEl = widget.querySelector('[data-weather-temp]');
        const conditionEl = widget.querySelector('[data-weather-condition]');
        const iconEl = widget.querySelector('[data-weather-icon]');

        const params = new URLSearchParams({
            latitude: String(TORONTO.latitude),
            longitude: String(TORONTO.longitude),
            current: 'temperature_2m,apparent_temperature,weather_code,is_day',
            timezone: TORONTO.timezone,
            temperature_unit: 'celsius',
            forecast_days: '1'
        });

        try {
            widget.dataset.state = 'loading';
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);

            const data = await response.json();
            const current = data.current;
            if (!current || typeof current.temperature_2m !== 'number') {
                throw new Error('Current weather payload unavailable');
            }

            const [condition, icon] = weatherLabels[current.weather_code] || ['Current weather', '◌'];
            const roundedTemp = Math.round(current.temperature_2m);
            const roundedFeels = Math.round(current.apparent_temperature ?? current.temperature_2m);

            if (tempEl) tempEl.textContent = `${roundedTemp}°C`;
            if (conditionEl) {
                conditionEl.textContent = condition;
                conditionEl.title = `${condition} · Feels like ${roundedFeels}°C`;
            }
            if (iconEl) iconEl.textContent = icon;

            widget.dataset.state = 'ready';
            widget.setAttribute(
                'aria-label',
                `Toronto weather: ${condition}, ${roundedTemp} degrees Celsius, feels like ${roundedFeels}. Local time ${formatTorontoTime()}.`
            );
        } catch (error) {
            console.warn('[CLYD3 weather]', error);
            widget.dataset.state = 'error';
            if (tempEl) tempEl.textContent = '--°C';
            if (conditionEl) conditionEl.textContent = 'Signal unavailable';
            if (iconEl) iconEl.textContent = '×';
        }
    };

    const boot = () => {
        const widget = buildWidget();
        if (!widget) return;

        updateClock(widget);
        window.setInterval(() => updateClock(widget), 1000);

        updateWeather(widget);
        window.setInterval(() => updateWeather(widget), WEATHER_REFRESH_MS);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
