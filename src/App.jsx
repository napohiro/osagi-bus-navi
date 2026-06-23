import { useState, useEffect } from 'react'
import './App.css'
import { busData, routeInfo, sourceInfo, destinations } from './data/busData'

function App() {
  const [direction, setDirection] = useState('nagakiToYukuhashi')
  const [dayType, setDayType] = useState('weekday')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

  const getFullSchedule = () => busData[dayType][direction] || []

  const getNextBus = () => {
    const schedule = getFullSchedule()
    return schedule.find(bus => timeToMinutes(bus.depart) > currentMinutes) || null
  }

  const getMinutesUntilDeparture = (bus) => {
    if (!bus) return null
    return timeToMinutes(bus.depart) - currentMinutes
  }

  const isWithinTenMinutes = (minutes) => minutes !== null && minutes <= 10

  const getTomorrowFirstBus = () => {
    const tomorrow = new Date(currentTime)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowType = isWeekend(tomorrow) ? 'holiday' : 'weekday'
    const schedule = busData[tomorrowType][direction] || []
    return schedule.length > 0 ? schedule[0] : null
  }

  // 目的地ガイド用：長木→行橋の次のバスを返す（allowedDepartures で絞り込み）
  const getNextBusForDestination = (dest) => {
    const schedule = busData[dayType].nagakiToYukuhashi || []
    return schedule.find(bus => {
      if (timeToMinutes(bus.depart) <= currentMinutes) return false
      if (dest.allowedDepartures) return dest.allowedDepartures.includes(bus.depart)
      return true
    }) || null
  }

  const nextBus = getNextBus()
  const minutesUntil = getMinutesUntilDeparture(nextBus)
  const fullSchedule = getFullSchedule()
  const isServiceEnded = nextBus === null
  const tomorrowFirstBus = isServiceEnded ? getTomorrowFirstBus() : null
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][currentTime.getDay()]
  const dayTypeLabel = isWeekend(currentTime) ? '土日祝' : '平日'
  const selectedDayLabel = dayType === 'weekday' ? '平日' : '土日祝'
  const directionLabel = direction === 'nagakiToYukuhashi' ? '長木 → 行橋駅' : '行橋駅 → 長木'

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">長木バスナビ</h1>
        <div className="current-info">
          <div className="info-item">
            <div className="info-label">現在時刻</div>
            <div className="info-value">{currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="info-item">
            <div className="info-label">今日</div>
            <div className="info-value">{dayOfWeek}曜日（{dayTypeLabel}）</div>
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* 方向と曜日の切り替え */}
        <div className="tab-container">
          <div className="tab-group">
            <label className="tab-label">方向</label>
            <div className="tab-buttons">
              <button
                className={`tab-button ${direction === 'nagakiToYukuhashi' ? 'active' : ''}`}
                onClick={() => setDirection('nagakiToYukuhashi')}
              >
                長木 → 行橋駅
              </button>
              <button
                className={`tab-button ${direction === 'yukuhashiToNagaki' ? 'active' : ''}`}
                onClick={() => setDirection('yukuhashiToNagaki')}
              >
                行橋駅 → 長木
              </button>
            </div>
          </div>
          <div className="tab-group">
            <label className="tab-label">ダイヤ</label>
            <div className="tab-buttons">
              <button
                className={`tab-button ${dayType === 'weekday' ? 'active' : ''}`}
                onClick={() => setDayType('weekday')}
              >
                平日
              </button>
              <button
                className={`tab-button ${dayType === 'holiday' ? 'active' : ''}`}
                onClick={() => setDayType('holiday')}
              >
                土日祝
              </button>
            </div>
          </div>
        </div>

        {/* ── セクション1：次のバス ── */}
        <section className="section-block">
          <h2 className="section-heading">次のバス</h2>

          {nextBus ? (
            <div className={`next-bus-card ${isWithinTenMinutes(minutesUntil) ? 'urgent' : ''}`}>
              <div className="next-bus-label">次の出発</div>
              <div className="next-bus-time">{nextBus.depart}</div>
              <div className="next-bus-destination">{nextBus.destination}</div>
              <div className="next-bus-info">
                <div className="info-box">
                  <div className="info-box-label">到着目安</div>
                  <div className="info-box-value">{nextBus.arrive}</div>
                </div>
                <div className="info-box">
                  <div className="info-box-label">あと</div>
                  <div className="info-box-value">{minutesUntil}分</div>
                </div>
                <div className="info-box">
                  <div className="info-box-label">運賃</div>
                  <div className="info-box-value">¥{nextBus.fare}</div>
                </div>
              </div>
              {nextBus.memo && <div className="next-bus-memo">💡 {nextBus.memo}</div>}
            </div>
          ) : (
            <div className="service-ended-box">
              <div className="service-ended-main">本日の便は終了しました</div>
              <div className="service-ended-sub">下に本日の全時刻表を表示しています</div>
              {tomorrowFirstBus ? (
                <div className="tomorrow-first-bus">
                  明日の始発：{tomorrowFirstBus.depart}
                </div>
              ) : (
                <div className="service-ended-sub">明日の時刻表は未入力です</div>
              )}
            </div>
          )}
        </section>

        {/* ── セクション2：本日の全時刻表 ── */}
        <section className="section-block">
            <h2 className="section-heading full-timetable-heading">本日の全時刻表：{directionLabel}（{selectedDayLabel}）</h2>
            <p className="timetable-sub">始発から最終まで全便を表示しています</p>

            {fullSchedule.map((bus, index) => {
              const isPast = timeToMinutes(bus.depart) <= currentMinutes
              const isFirst = index === 0
              const isLast = index === fullSchedule.length - 1
              const isNextBusCard = nextBus && bus.depart === nextBus.depart && !isPast

              return (
                <div
                  key={index}
                  className={`bus-card ${isPast ? 'bus-card-past' : 'bus-card-upcoming'} ${isNextBusCard ? 'bus-card-next' : ''}`}
                >
                  <div className="bus-badges">
                    {isFirst && <span className="badge badge-first">始発</span>}
                    {isLast && <span className="badge badge-last">最終</span>}
                    {isNextBusCard && <span className="badge badge-next">次のバス</span>}
                    {isPast && <span className="badge badge-past">出発済</span>}
                  </div>
                  <div className="bus-time-row">
                    <div className={`bus-departure ${isPast ? 'text-past' : ''}`}>{bus.depart}</div>
                    <div className="bus-arrow">→</div>
                    <div className="bus-arrival">{bus.arrive}</div>
                  </div>
                  <div className="bus-details">
                    <div className="bus-detail-item">
                      <div className="bus-detail-label">路線</div>
                      <div className="bus-detail-value">{bus.line}</div>
                    </div>
                    <div className="bus-detail-item">
                      <div className="bus-detail-label">行先</div>
                      <div className="bus-detail-value">{bus.destination}</div>
                    </div>
                    <div className="bus-detail-item">
                      <div className="bus-detail-label">経由</div>
                      <div className="bus-detail-value">
                        <div className="bus-via">
                          {bus.via.map((stop, idx) => (
                            <span key={idx} className="bus-via-item">{stop}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bus-detail-item">
                      <div className="bus-detail-label">運賃</div>
                      <div className="bus-detail-value bus-fare">¥{bus.fare}</div>
                    </div>
                  </div>
                  {bus.memo && <div className="bus-memo">💡 {bus.memo}</div>}
                </div>
              )
            })}
          </section>

        {/* ── セクション3：目的地ガイド ── */}
        <section className="section-block">
          <h2 className="section-heading">目的地ガイド</h2>
          <p className="timetable-sub">長木発・どのバスに乗ればよいか一目でわかります</p>

          {destinations.map((dest) => {
            const nextForDest = getNextBusForDestination(dest)
            const minutesToNext = nextForDest ? timeToMinutes(nextForDest.depart) - currentMinutes : null

            return (
              <div key={dest.name} className="dest-card">
                <div className="dest-card-header">
                  <span className="dest-icon">{dest.icon}</span>
                  <div className="dest-title-block">
                    <div className="dest-name">{dest.name}</div>
                    <div className="dest-description">{dest.description}</div>
                  </div>
                </div>

                <div className="dest-next-bus">
                  <div className="dest-next-label">おすすめ便（次のバス）</div>
                  {nextForDest ? (
                    <div className="dest-next-value">
                      <span className="dest-depart-time">{nextForDest.depart} 発</span>
                      <span className={`dest-minutes-badge ${minutesToNext <= 10 ? 'urgent' : ''}`}>
                        あと{minutesToNext}分
                      </span>
                    </div>
                  ) : (
                    <div className="dest-no-bus">本日の便は終了しました</div>
                  )}
                </div>

                <div className="dest-info-grid">
                  <div className="dest-info-cell">
                    <div className="dest-info-label">運賃</div>
                    <div className="dest-info-value dest-fare">{dest.fare}</div>
                  </div>
                  <div className="dest-info-cell">
                    <div className="dest-info-label">所要時間</div>
                    <div className="dest-info-value">{dest.duration}</div>
                  </div>
                  <div className="dest-info-cell">
                    <div className="dest-info-label">降車場所</div>
                    <div className="dest-info-value">{dest.alightAt}</div>
                  </div>
                  <div className="dest-info-cell">
                    <div className="dest-info-label">徒歩時間</div>
                    <div className="dest-info-value">{dest.walkTime}</div>
                  </div>
                </div>

                {dest.note && (
                  <div className="dest-note">💡 {dest.note}</div>
                )}
              </div>
            )
          })}

          <div className="dest-walk-disclaimer">
            ※ 徒歩時間は目安です。実際の道路状況によって異なります。
          </div>
        </section>

        {/* ── セクション4：路線情報 ── */}
        <section className="section-block route-info-section">
          <h2 className="section-heading">路線情報</h2>

          <div className="info-section">
            <div className="info-section-title">路線名</div>
            <div className="info-section-content">{routeInfo.routeName}</div>
          </div>

          <div className="info-section">
            <div className="info-section-title">主な経由地</div>
            <div className="stops-list">
              {routeInfo.mainStops.map((stop, index) => (
                <span key={index} className="stop-badge">{stop}</span>
              ))}
            </div>
          </div>

          <div className="info-section">
            <div className="info-section-title">主な利用区間</div>
            <div className="info-section-content">長木 ⇔ 行橋駅東口</div>
          </div>

          <div className="info-section">
            <div className="info-section-title">運賃目安</div>
            <div className="info-section-content">{routeInfo.fareNote}</div>
          </div>

          <div className="info-section">
            <div className="info-section-title">ダイヤ改正</div>
            <div className="info-section-content">{sourceInfo.revision}</div>
          </div>

          <div className="info-section">
            <div className="info-section-title">時刻表確認日</div>
            <div className="info-section-content">{sourceInfo.lastCheckedLabel}</div>
          </div>

          <div className="info-section">
            <div className="info-section-title">停車バス停一覧</div>
            <p className="stops-direction-note">ゆめタウン（行橋）→ 香春町役場 方向の順</p>
            <ol className="stop-list">
              {routeInfo.stops.map((stop, index) => (
                <li
                  key={index}
                  className={`stop-list-item ${stop.name === '長木' ? 'stop-list-item-home' : ''}`}
                >
                  <span className="stop-list-name">{stop.name}</span>
                  {stop.name === '長木' && (
                    <span className="stop-home-badge">ここ</span>
                  )}
                  {stop.note && (
                    <span className="stop-note">{stop.note}</span>
                  )}
                </li>
              ))}
            </ol>
            <p className="stop-list-disclaimer">
              ※ 停車バス停は参考情報です。実際の停留所・時刻は太陽交通公式情報をご確認ください。
            </p>
          </div>

          <div className="warning-text">
            ⚠️ {routeInfo.notice}
          </div>

          <div className="auto-update-notice">
            🔄 {sourceInfo.autoUpdateNotice}
          </div>

          <div className="official-links-section">
            <div className="official-links-title">公式サイトで確認する</div>
            <div className="official-links">
              <a
                href={sourceInfo.officialTimetableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="official-link-button"
              >
                太陽交通 時刻表を確認
              </a>
              <a
                href={sourceInfo.officialFareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="official-link-button"
              >
                太陽交通 運賃表を確認
              </a>
              <a
                href={sourceInfo.cityPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="official-link-button city-link"
              >
                行橋市 路線バス情報を確認
              </a>
            </div>
          </div>
        </section>

        <div className="notice-text">
          ⚠️ 【公式情報確認必須】このアプリの時刻表は参考情報です。実際のご利用前に、太陽交通の公式ウェブサイトで最新の時刻表をご確認ください。
        </div>
      </div>

      <footer className="app-footer">
        <p>長木バスナビ - 福岡県行橋市 長木バス停の時刻表アプリ</p>
        <p>時刻表確認日：{sourceInfo.lastCheckedLabel}　ダイヤ改正：{sourceInfo.revision}</p>
        <p>© 2026 長木バスナビ - Netlify</p>
      </footer>
    </div>
  )
}

export default App
