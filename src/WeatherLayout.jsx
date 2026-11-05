import { CloudSun, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Droplets, Gauge, MapPin, RefreshCw, Search, Star, Sunrise, Sunset, Thermometer, Wind, ChevronDown } from 'lucide-react'

const weatherInfo = (code, day = true) => {
  if (code === 0) return { label: 'Trời quang', Icon: day ? Sun : CloudSun, tone: 'sun' }
  if ([1, 2].includes(code)) return { label: code === 1 ? 'Ít mây' : 'Có mây', Icon: day ? CloudSun : Cloud, tone: 'cloud' }
  if (code === 3) return { label: 'Nhiều mây', Icon: Cloud, tone: 'cloud' }
  if ([45, 48].includes(code)) return { label: 'Sương mù', Icon: CloudFog, tone: 'fog' }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Mưa phùn', Icon: CloudDrizzle, tone: 'rain' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Có mưa', Icon: CloudRain, tone: 'rain' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Có tuyết', Icon: CloudSnow, tone: 'snow' }
  if ([95, 96, 99].includes(code)) return { label: 'Dông', Icon: CloudLightning, tone: 'storm' }
  return { label: 'Có mây', Icon: CloudSun, tone: 'cloud' }
}

export default function WeatherLayout({ selected, visibleCities, query, setQuery, favorites, unit, setUnit, loading, error, fetchWeather, chooseCity, current, daily, weatherNow, scene, temp, weekday, dateLabel, hourlyForecast, hourLabel, hourPeriod }) {
  const CurrentIcon = weatherNow?.Icon ?? CloudSun

  return (
    <main className={'weather-page ' + (current ? (current.is_day ? 'day' : 'night') : 'day')} style={{ '--weather-image': scene.image }}>
      <div className="scene-overlay" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Thời tiết, trang chủ">
          <span className="brand-mark"><CloudSun size={19} /></span>
          <span>THỜI TIẾT</span>
        </a>

        <details className="city-picker">
          <summary><MapPin size={15} /><span>{selected ? `Thời tiết tại ${selected.name}` : 'Chọn thành phố'}</span><ChevronDown size={14} /></summary>
          <div className="city-menu">
            <label className="city-search"><Search size={15} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm thành phố" aria-label="Tìm thành phố" /></label>
            <div className="city-picker-list">
              {visibleCities.map(city => (
                <button key={city.name} className={selected?.name === city.name ? 'active' : ''} onClick={() => chooseCity(city)}>
                  <span><strong>{city.name}</strong><small>{city.region}</small></span>
                  {favorites.includes(city.name) && <Star size={13} fill="currentColor" />}
                </button>
              ))}
              {visibleCities.length === 0 && <p className="empty-cities">Không tìm thấy thành phố.</p>}
            </div>
          </div>
        </details>

        <div className="topbar-actions">
          <div className="unit-switch" aria-label="Đơn vị nhiệt độ">
            <button className={unit === 'C' ? 'chosen' : ''} onClick={() => setUnit('C')}>°C</button>
            <span>|</span>
            <button className={unit === 'F' ? 'chosen' : ''} onClick={() => setUnit('F')}>°F</button>
          </div>
          <span className="top-divider" />
          <span className="top-region">VIỆT NAM</span>
          <button className="refresh-button" aria-label="Tải lại thời tiết" onClick={() => fetchWeather()} disabled={loading || !selected}>
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>

      <div className="weather-content" id="top">
        {error && <div className="error-banner"><div><strong>Chưa tải được dữ liệu</strong><span>{error} Kiểm tra kết nối rồi thử lại nhé.</span></div><button onClick={() => fetchWeather()}><RefreshCw size={14} /> Thử lại</button></div>}

        <section className="current-layout">
          <div className="current-weather">
            <div className="current-kicker">{selected ? selected.region.toUpperCase() : 'DỰ BÁO THỜI TIẾT VIỆT NAM'}</div>
            <div className="current-date">{current ? `${weekday(new Date(`${current.time.replace(' ', 'T')}:00`))} · ${current.time.replace('T', ' ')}` : selected ? (loading ? 'Đang lấy dữ liệu thời tiết…' : 'Chưa có dữ liệu') : 'Chọn thành phố để xem thời tiết'}</div>
            <div className="temperature-row">
              <div className={'current-weather-icon ' + (weatherNow?.tone ?? 'cloud')}><CurrentIcon size={78} strokeWidth={1.35} /></div>
              <div className="temperature-value">{temp(current?.temperature_2m)}<small>{unit}</small></div>
            </div>
            <div className="weather-condition">{weatherNow?.label ?? (loading ? 'Đang tải…' : 'Chưa chọn thành phố')}</div>
            <div className="feels-like">Cảm giác như {temp(current?.apparent_temperature)}{unit}</div>
            <p className="weather-caption">{current ? `${weatherNow.label}. ${current.precipitation ? `Lượng mưa hiện tại ${current.precipitation} mm.` : 'Chưa ghi nhận mưa.'}` : 'Chọn một trong 8 thành phố ở phía trên để bắt đầu.'}</p>
            <div className="sun-summary">
              <span><Sunrise size={15} /><small>Bình minh</small><b>{hourLabel(daily?.sunrise?.[0])}</b></span>
              <i />
              <span><Sunset size={15} /><small>Hoàng hôn</small><b>{hourLabel(daily?.sunset?.[0])}</b></span>
            </div>
          </div>

          <div className="weather-side">
            <section className="details-panel">
              <div className="panel-heading"><span>ĐIỀU KIỆN HIỆN TẠI</span><h2>Chi tiết thời tiết</h2></div>
              <div className="details-list">
                <div><span><Thermometer size={15} /> Cảm giác như</span><strong>{temp(current?.apparent_temperature)}{unit}</strong></div>
                <div><span><Droplets size={15} /> Độ ẩm</span><strong>{current ? `${Math.round(current.relative_humidity_2m)}%` : '—'}</strong></div>
                <div><span><Wind size={15} /> Tốc độ gió</span><strong>{current ? `${Math.round(current.wind_speed_10m)} km/h` : '—'}</strong></div>
                <div><span><Gauge size={15} /> Áp suất</span><strong>{current?.pressure_msl ? `${Math.round(current.pressure_msl)} hPa` : '—'}</strong></div>
              </div>
            </section>

            <section className="hourly-panel">
              <div className="panel-heading hourly-heading"><div><span>DỰ BÁO TRONG NGÀY</span><h2>Theo giờ</h2></div><span className="hourly-timezone">GMT+7</span></div>
              {hourlyForecast.length ? (
                <div className="hourly-list">
                  {hourlyForecast.map((hour, index) => {
                    const localHour = Number(hour.time.split('T')[1]?.slice(0, 2))
                    const condition = weatherInfo(hour.code, localHour >= 6 && localHour < 18)
                    const Icon = condition.Icon
                    return <div className={'hour-item ' + (index === 0 ? 'now' : '')} key={hour.time}>
                      <span className="hour-period">{index === 0 ? 'BÂY GIỜ' : hourPeriod(hour.time)}</span>
                      <Icon className={'hour-icon ' + condition.tone} size={22} strokeWidth={1.6} />
                      <strong>{temp(hour.temperature)}{unit}</strong>
                      <small>{hourLabel(hour.time)}</small>
                    </div>
                  })}
                </div>
              ) : <p className="hourly-empty">{loading ? 'Đang tải dự báo…' : 'Chọn thành phố để xem dự báo theo giờ.'}</p>}
            </section>
          </div>
        </section>

        <section className="week-section">
          <div className="week-heading"><div><span>DỰ BÁO DÀI HẠN</span><h2>7 ngày tới</h2></div><span className="week-note">{selected ? 'Nhiệt độ cao nhất · thấp nhất' : 'Chọn thành phố để xem dự báo'}</span></div>
          <div className={'week-grid ' + (loading ? 'is-loading' : '')}>
            {Array.from({ length: 7 }, (_, index) => {
              const date = daily?.time?.[index]
              const condition = weatherInfo(daily?.weather_code?.[index] ?? 2)
              const Icon = condition.Icon
              const dayText = index === 0 ? 'Hôm nay' : date ? weekday(new Date(`${date}T12:00:00`), { weekday: 'short' }) : '—'
              const precip = daily?.precipitation_probability_max?.[index]
              return <article className={'day-card ' + (index === 0 ? 'today' : '')} key={date || index}>
                <div className="day-card-date"><strong>{dayText}</strong><small>{date ? dateLabel(date) : '—'}</small></div>
                <Icon className={'day-icon ' + condition.tone} size={27} strokeWidth={1.5} />
                <span className="day-condition">{condition.label}</span>
                <div className="day-temperatures"><strong>{temp(daily?.temperature_2m_max?.[index])}{unit}</strong><span>{temp(daily?.temperature_2m_min?.[index])}{unit}</span></div>
                <span className="day-rain"><Droplets size={12} />{precip == null ? '—' : `${precip}%`}</span>
              </article>
            })}
          </div>
          <div className="page-footer"><span>Ảnh nền: <a href={scene.credit} target="_blank" rel="noreferrer">Pexels</a></span><span>Dữ liệu thời tiết: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open‑Meteo</a></span></div>
        </section>
      </div>
    </main>
  )
}
