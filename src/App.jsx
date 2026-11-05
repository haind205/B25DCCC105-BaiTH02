import { useEffect, useMemo, useState } from 'react'
import { CloudSun, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Droplets, Wind, Gauge, Search, MapPin, Star, RefreshCw, ChevronDown, ArrowUpRight, Thermometer, Sunrise, Sunset } from 'lucide-react'

const cities = [
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542, region: 'Miền Bắc' },
  { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881, region: 'Miền Bắc' },
  { name: 'Huế', lat: 16.4637, lon: 107.5909, region: 'Miền Trung' },
  { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022, region: 'Miền Trung' },
  { name: 'Nha Trang', lat: 12.2388, lon: 109.1967, region: 'Miền Trung' },
  { name: 'Đà Lạt', lat: 11.9404, lon: 108.4583, region: 'Tây Nguyên' },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297, region: 'Miền Nam' },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469, region: 'Miền Nam' },
]

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

const weekday = (date, options = { weekday: 'long' }) => new Intl.DateTimeFormat('vi-VN', options).format(date)
const dateLabel = (iso, options = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat('vi-VN', options).format(new Date(`${iso}T12:00:00`))
const toFahrenheit = c => Math.round((c * 9) / 5 + 32)
const formatApiTime = value => {
  if (!value) return '—'
  const [date, time] = value.split('T')
  const [year, month, day] = date.split('-')
  return `${time} · ${day}/${month}/${year}`
}

const weatherScene = code => {
  const scene = (photoId, page) => ({
    image: `url("https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1800")`,
    credit: page,
  })
  if ([95, 96, 99].includes(code)) return scene(37098587, 'https://www.pexels.com/photo/dramatic-overcast-sky-with-storm-clouds-37098587/')
  if ([71, 73, 75, 77, 85, 86].includes(code)) return scene(35637271, 'https://www.pexels.com/photo/snow-covered-mountain-landscape-in-winter-35637271/')
  if ([45, 48].includes(code)) return scene(31612213, 'https://www.pexels.com/photo/misty-forest-landscape-in-early-morning-fog-31612213/')
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return scene(4609228, 'https://www.pexels.com/photo/storm-clouds-forming-over-the-open-sea-4609228/')
  if (code === 0) return scene(18210769, 'https://www.pexels.com/photo/clouds-on-a-sunny-sky-18210769/')
  if ([1, 2, 3].includes(code)) return scene(29663358, 'https://www.pexels.com/photo/serene-sky-with-sunlight-breaking-through-clouds-29663358/')
  return scene(29663358, 'https://www.pexels.com/photo/serene-sky-with-sunlight-breaking-through-clouds-29663358/')
}

function App() {
  const [selected, setSelected] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unit, setUnit] = useState('C')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('may-favorites')) || ['Hà Nội'] } catch { return ['Hà Nội'] }
  })
  const [now, setNow] = useState(new Date())

  const fetchWeather = async (city = selected) => {
    if (!city) return
    setLoading(true); setError(''); setWeather(null)
    const params = new URLSearchParams({ latitude: city.lat, longitude: city.lon, current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset', timezone: 'Asia/Ho_Chi_Minh', forecast_days: '7' })
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      if (!response.ok) throw new Error('Không thể kết nối máy chủ thời tiết.')
      const result = await response.json()
      if (!result.current || !result.daily) throw new Error('Dữ liệu thời tiết chưa sẵn sàng.')
      setWeather(result)
    } catch (e) { setError(e.message || 'Đã xảy ra lỗi. Vui lòng thử lại.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (selected) fetchWeather(selected)
    else { setWeather(null); setError(''); setLoading(false) }
  }, [selected])
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(timer) }, [])
  useEffect(() => { localStorage.setItem('may-favorites', JSON.stringify(favorites)) }, [favorites])

  const visibleCities = useMemo(() => {
    const normalize = value => value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    const q = normalize(query.trim())
    return cities.filter(city => !q || normalize(city.name).includes(q))
  }, [query])
  const current = weather?.current
  const daily = weather?.daily
  const weatherNow = current ? weatherInfo(current.weather_code, Boolean(current.is_day)) : null
  const scene = weatherScene(current?.weather_code ?? 2)
  const TempIcon = weatherNow?.Icon ?? CloudSun
  const temp = value => value == null ? '—' : `${unit === 'C' ? Math.round(value) : toFahrenheit(value)}°`
  const localTime = iso => iso?.split('T')[1]?.slice(0, 5) || '—'
  const isDaytime = now.getHours() >= 6 && now.getHours() < 18

  const chooseCity = city => { setSelected(city); setQuery(''); document.querySelector('.sidebar')?.classList.remove('mobile-open') }
  const toggleFavorite = cityName => setFavorites(prev => prev.includes(cityName) ? prev.filter(name => name !== cityName) : [...prev, cityName])

  return <main className={`app-shell ${isDaytime ? 'day' : 'night'}`}>
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="Thời tiết, trang chủ"><span className="brand-mark"><CloudSun size={21} strokeWidth={2.2} /></span><span>Thời tiết</span></a>
      <div className="side-label">KHÁM PHÁ</div>
      <button className="nav-item active"><span className="nav-icon"><CloudSun size={18}/></span>Thời tiết</button>
      <div className="side-divider" />
      <div className="side-label city-label">THÀNH PHỐ <span>{cities.length}</span></div>
      <label className="search-box"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm thành phố" aria-label="Tìm thành phố" />{query && <button onClick={() => setQuery('')} aria-label="Xóa tìm kiếm">×</button>}</label>
      <div className="city-list">
        {visibleCities.map(city => {
          const active = selected?.name === city.name
          const favorite = favorites.includes(city.name)
          return <button key={city.name} className={`city-item ${active ? 'selected' : ''}`} onClick={() => chooseCity(city)}>
            <span className="city-marker"><MapPin size={15}/></span><span className="city-copy"><strong>{city.name}</strong><small>{city.region}</small></span>
            {favorite && <Star className="favorite-indicator" size={13} fill="currentColor"/>}
            <span className="city-temp">{active && current ? temp(current.temperature_2m) : '···'}</span>
          </button>
        })}
        {visibleCities.length === 0 && <div className="no-cities">Không tìm thấy thành phố.</div>}
      </div>
      <div className="sidebar-bottom"><div className="live-dot"/><span>Dữ liệu trực tiếp từ Open‑Meteo</span></div>
    </aside>

    <section className="main-area" id="top">
      <header className="topbar"><div className="breadcrumb">Tổng quan <span>/</span> <strong>{selected?.name ?? 'Chọn thành phố'}</strong></div>
        <div className="top-actions"><div className="updated">{current && <span className="live-dot"/>}{current ? `Cập nhật lúc ${formatApiTime(current.time)}` : selected ? (loading ? 'Đang tải dữ liệu' : 'Chưa có dữ liệu') : 'Chưa chọn thành phố'}</div><div className="unit-switch" aria-label="Đơn vị nhiệt độ"><button className={unit === 'C' ? 'chosen' : ''} onClick={() => setUnit('C')}>°C</button><button className={unit === 'F' ? 'chosen' : ''} onClick={() => setUnit('F')}>°F</button></div><button className="icon-button" aria-label="Tải lại thời tiết" onClick={() => fetchWeather()} disabled={loading || !selected}><RefreshCw size={17} className={loading ? 'spinning' : ''}/></button></div>
      </header>

      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">THỜI TIẾT VIỆT NAM <span className="eyebrow-line"/></div><h1>Chào buổi {now.getHours() < 11 ? 'sáng' : now.getHours() < 18 ? 'chiều' : 'tối'} <span className="wave">✳</span></h1><p>Theo dõi bầu trời ở nơi bạn quan tâm.</p></div><div className="today-date"><span>{weekday(now)}</span><strong>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)}</strong></div></div>

        {error && <div className="error-banner"><div><strong>Chưa tải được dữ liệu</strong><span>{error} Kiểm tra kết nối rồi thử lại nhé.</span></div><button onClick={() => fetchWeather()}><RefreshCw size={14}/> Thử lại</button></div>}

        <div className="dashboard-grid">
          <article className="hero-card" style={{ '--weather-image': scene.image }}>
            <div className="hero-top"><div><div className="location-kicker"><MapPin size={13}/> {selected?.region.toUpperCase() ?? '8 THÀNH PHỐ VIỆT NAM'}</div><h2>{selected?.name ?? 'Chưa chọn thành phố'}{selected && <button className={`star-button ${favorites.includes(selected.name) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(selected.name)} aria-label={favorites.includes(selected.name) ? 'Bỏ yêu thích' : 'Thêm yêu thích'}><Star size={18} fill={favorites.includes(selected.name) ? 'currentColor' : 'none'}/></button>}</h2><div className="local-time">{current ? <><span>Thời điểm cập nhật</span> <b>{formatApiTime(current.time)}</b></> : <span>{selected ? (loading ? 'Đang tải dữ liệu thời tiết…' : 'Chưa có dữ liệu thời tiết') : 'Chọn một thành phố ở thanh bên để bắt đầu'}</span>}</div></div><div className="hero-weather-icon"><TempIcon size={76} strokeWidth={1.35}/></div></div>
            <div className="hero-temperature"><span>{loading && !current ? '—' : temp(current?.temperature_2m)}</span><div><strong>{weatherNow?.label ?? (selected ? (loading ? 'Đang tải…' : 'Chưa có dữ liệu') : 'Chọn thành phố')}</strong><small>Cảm giác như {temp(current?.apparent_temperature)}</small></div></div>
            <div className="hero-bottom"><span><Thermometer size={15}/> Hôm nay <b>{temp(daily?.temperature_2m_min?.[0])} / {temp(daily?.temperature_2m_max?.[0])}</b></span><span className="hero-meta"><span className="hero-condition-tag">{current ? (current.is_day ? '☼  Ban ngày' : '☾  Ban đêm') : 'Chưa có dữ liệu'}</span><a className="photo-credit" href={scene.credit} target="_blank" rel="noreferrer">Ảnh: Pexels ↗</a></span></div>
            {loading && <div className="loading-overlay"><span className="loader"/>Đang cập nhật thời tiết</div>}
          </article>

          <article className="details-card">
            <div className="card-title"><div><span className="section-kicker">ĐIỀU KIỆN HIỆN TẠI</span><h3>Chi tiết thời tiết</h3></div><span className="subtle-icon"><ArrowUpRight size={16}/></span></div>
            <div className="metric-grid">
              <Metric icon={Droplets} label="Độ ẩm" value={current ? `${Math.round(current.relative_humidity_2m)}%` : '—'} note="Không khí" color="blue" />
              <Metric icon={Wind} label="Tốc độ gió" value={current ? `${Math.round(current.wind_speed_10m)} km/h` : '—'} note="Gió nhẹ" color="mint" />
              <Metric icon={CloudRain} label="Lượng mưa" value={current ? `${current.precipitation} mm` : '—'} note="Hiện tại" color="violet" />
              <Metric icon={Gauge} label="Thời tiết" value={weatherNow?.label ?? '—'} note="Mã WMO" color="amber" />
            </div>
            <div className="sun-times"><span><Sunrise size={16}/><small>Bình minh</small><b>{localTime(daily?.sunrise?.[0])}</b></span><i/><span><Sunset size={16}/><small>Hoàng hôn</small><b>{localTime(daily?.sunset?.[0])}</b></span><span className="sun-track"><i/></span></div>
          </article>
        </div>

        <section className="forecast-section">
          <div className="section-heading"><div><span className="section-kicker">BẠN CÓ THỂ LÊN KẾ HOẠCH</span><h3>Dự báo 7 ngày</h3></div><span className="forecast-note"><span className="tiny-dot"/> Cập nhật mỗi giờ</span></div>
          <div className={`forecast-card ${loading ? 'is-loading' : ''}`}>
            {Array.from({ length: 7 }, (_, index) => {
              const date = daily?.time?.[index]
              const condition = weatherInfo(daily?.weather_code?.[index] ?? 2)
              const Icon = condition.Icon
              const dayText = index === 0 ? 'Hôm nay' : date ? weekday(new Date(`${date}T12:00:00`), { weekday: 'short' }) : '—'
              const precip = daily?.precipitation_probability_max?.[index]
              return <div className={`forecast-day ${index === 0 ? 'today' : ''}`} key={date || index}>
                <div className="forecast-date"><strong>{dayText}</strong><small>{date ? dateLabel(date) : '—'}</small></div>
                <div className={`forecast-weather-icon ${condition.tone}`}><Icon size={24} strokeWidth={1.7}/></div>
                <span className="forecast-condition">{condition.label}</span>
                <div className="temp-range"><b>{temp(daily?.temperature_2m_max?.[index])}</b><span className="range-track"><i style={{ left: `${Math.max(0, Math.min(76, ((daily?.temperature_2m_min?.[index] ?? 0) + 5) * 2))}%`, width: '36%' }}/></span><small>{temp(daily?.temperature_2m_min?.[index])}</small></div>
                <span className="rain-chance"><Droplets size={12}/>{precip == null ? '—' : `${precip}%`}</span>
              </div>
            })}
          </div>
          <div className="forecast-footnote">Dự báo nhiệt độ cao nhất và thấp nhất trong ngày <span>•</span> Múi giờ Việt Nam (GMT+7)</div>
        </section>

        <footer className="footer"><span>Made for a brighter day <span className="footer-sun">✳</span></span><span>Nguồn dữ liệu <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open‑Meteo ↗</a></span></footer>
      </div>
    </section>
    <button className="mobile-city-select" onClick={() => document.querySelector('.sidebar')?.classList.toggle('mobile-open')}><MapPin size={16}/>{selected?.name ?? 'Chọn thành phố'}<ChevronDown size={15}/></button>
  </main>
}

function Metric({ icon: Icon, label, value, note, color }) {
  return <div className="metric"><div className={`metric-icon ${color}`}><Icon size={17}/></div><div className="metric-text"><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>
}

export default App
