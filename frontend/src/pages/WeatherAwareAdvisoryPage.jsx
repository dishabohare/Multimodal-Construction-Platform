import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Search,
  RefreshCw,
  Info,
  Calendar,
  CloudRain
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { StatusBadge } from '../components/StatusBadge';

export const WeatherAwareAdvisoryPage = () => {
  const { addToast } = useApp();

  const [location, setLocation] = useState('Metro City Financial Sector');
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (loc) => {
    setLoading(true);
    try {
      const data = await api.getWeather(loc || location);
      setWeatherData(data);
      setLocation(data.location);
    } catch (err) {
      console.error('Weather fetch error:', err);
      addToast('Failed to load weather data. Using local model.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
      setSearchInput('');
    }
  };

  const presetLocations = [
    'Downtown Metro Core',
    'Coastal Port Pier 4',
    'Industrial Valley Corridor',
    'Greenfield Ridge',
    'North River Basin'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-1">
            <CloudSun className="w-3.5 h-3.5" />
            <span>Hyper-Local Atmospheric Operations Safety</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Weather-Aware Site Advisory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate atmospheric conditions against concrete curing kinetics, wind thresholds for crane lifting, and trench safety.
          </p>
        </div>

        {/* Location Search Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Change location..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-safety-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Preset Location Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium">Quick Sites:</span>
        {presetLocations.map((loc, i) => (
          <button
            key={i}
            onClick={() => fetchWeather(loc)}
            className={`px-2.5 py-1 rounded-full border transition shrink-0 ${
              location === loc
                ? 'bg-safety-600 text-white border-safety-600 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {loading && !weatherData ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <RefreshCw className="w-8 h-8 text-safety-500 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Calibrating meteorological radar telemetry...</p>
        </div>
      ) : weatherData ? (
        <>
          {/* Weather Current Conditions Hero */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Primary Condition */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Atmospheric Condition
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-safety-500/20 text-safety-400 border border-safety-500/30">
                    Live Telemetry
                  </span>
                </div>
                <div className="mt-3 flex items-center space-x-4">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    {weatherData.temperature_c}°C
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-200">{weatherData.weather_condition}</div>
                    <div className="text-xs text-slate-400">Feels like {weatherData.feels_like_c}°C</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-safety-500" />
                  <span>{weatherData.location}</span>
                </span>
                <span>Observation Window: Shift 1</span>
              </div>
            </div>

            {/* Humidity & Rain */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-400">Precipitation</span>
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{weatherData.rain_probability_pct}%</div>
                <p className="text-xs text-slate-500 mt-1">Probability of rain during current shift</p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                Relative Humidity: <span className="font-bold text-slate-900">{weatherData.humidity_pct}%</span>
              </div>
            </div>

            {/* Wind Velocity */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-400">Wind Velocity</span>
                  <Wind className="w-4 h-4 text-safety-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{weatherData.wind_speed_kmh} km/h</div>
                <p className="text-xs text-slate-500 mt-1">
                  {weatherData.wind_speed_kmh > 38 ? (
                    <span className="text-rose-600 font-bold">Exceeds Crane Limit (38 km/h)</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Within Safe Rigging Limits</span>
                  )}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                Threshold: <span className="font-bold text-slate-900">38 km/h (Crane Hold)</span>
              </div>
            </div>
          </div>

          {/* Risk Alerts */}
          {weatherData.risk_alerts && weatherData.risk_alerts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-900">
              <span className="font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Atmospheric Risk Alerts for Site Superintendent:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {weatherData.risk_alerts.map((al, idx) => (
                  <li key={idx} className="font-medium">{al}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Activity Impact Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Construction Activity Impact Matrix</h3>
              <p className="text-xs text-slate-500">Operation suitability calculated for major trade sequences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {weatherData.advisories.map((adv, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{adv.activity}</span>
                      <StatusBadge status={adv.suitability} size="xs" />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {adv.guidelines}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Day Outlook */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
            <h3 className="text-base font-bold text-slate-900">5-Day Planning Horizon</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {weatherData.forecast_days.map((fc, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-1">
                  <div className="font-bold text-slate-800">{fc.day}</div>
                  <CloudSun className="w-5 h-5 mx-auto text-safety-500 my-1" />
                  <div className="font-bold text-slate-900">{fc.temp_high}° / {fc.temp_low}°</div>
                  <div className="text-[11px] text-blue-600 font-semibold">{fc.rain_pct}% Rain</div>
                  <div className="text-[10px] text-slate-400">{fc.condition}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <DemoDisclaimer
        title="Weather Advisory Source & Methodology"
        text={weatherData?.disclaimer || "Weather guidance is simulated/modeled for demonstration. Site supervisors must verify on-site anemometer readings before critical crane lifts or concrete placement."}
      />
    </div>
  );
};
