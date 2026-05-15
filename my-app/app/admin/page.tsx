'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [progressCount, setProgressCount] = useState(0);

  useEffect(() => {
    fetch('/api/get-series')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setSeries(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load series:', err));
  }, []);

  const runMasterScraper = async () => {
    if (!confirm("ต้องการเริ่มดูดข้อมูลทุกซีรีส์ใช่หรือไม่? (อาจใช้เวลาหลายนาที)")) return;

    setLoading(true);
    setProgressCount(0);
    let count = 0;

    for (const item of series) {
      setCurrentTask(`[ RUNNING ] ${item.code} — ${item.name}`);
      try {
        const res = await fetch(`/api/seed-onepiece?series=${item.url}&limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await res.json();
        count++;
        setProgressCount(count);
        setStatusMsg(`Scraped ${count} / ${series.length} series`);
      } catch (err) {
        console.error(`Error on ${item.code}:`, err);
      }
    }

    setLoading(false);
    setCurrentTask("[ COMPLETED ]");
    alert("บอททำงานเสร็จสิ้น ข้อมูล One Piece เต็มคลังแล้วครับ!");
  };

  const progressPct = series.length > 0 ? (progressCount / series.length) * 100 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ad-root {
          min-height: 100vh;
          background: #0d0d0d;
          color: #e8e4dc;
          display: flex;
          flex-direction: row;
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
        }

        /* ── Sidebar ── */
        .ad-sidebar {
          width: 240px;
          min-width: 240px;
          padding: 48px 32px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          border-right: 1px solid rgba(255,255,255,0.06);
          scrollbar-width: none;
        }
        .ad-sidebar::-webkit-scrollbar { display: none; }

        .ad-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #e8e4dc;
          text-transform: uppercase;
        }
        .ad-logo span { color: #c9a227; }

        .ad-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ad-nav-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.25);
          margin-bottom: 10px;
          font-weight: 400;
        }

        .ad-sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          display: flex;
          gap: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ad-sidebar-footer a {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.2);
          text-decoration: none;
          transition: color 0.15s;
        }
        .ad-sidebar-footer a:hover { color: rgba(232,228,220,0.55); }

        /* ── Main ── */
        .ad-main {
          flex: 1;
          padding: 48px 48px 64px;
          overflow-y: auto;
          height: 100vh;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        /* Header */
        .ad-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 32px;
          margin-bottom: 52px;
        }
        .ad-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #e8e4dc;
        }
        .ad-header-title span { color: #c9a227; }
        .ad-btn-back {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.3);
          text-decoration: none;
          padding: 10px 20px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          transition: all 0.2s;
          align-self: center;
        }
        .ad-btn-back:hover {
          color: #c9a227;
          border-color: rgba(201,162,39,0.4);
        }

        .ad-header-sub {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.22);
          margin-top: 6px;
        }

        /* Panel */
        .ad-panel {
          background: #111111;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 40px;
          border-radius: 2px;
          margin-bottom: 48px;
        }
        .ad-panel-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.25);
          margin-bottom: 28px;
        }

        /* Status */
        .ad-status-idle {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ad-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5cb85c;
          flex-shrink: 0;
        }
        .ad-dot.working {
          background: #c9a227;
          animation: pulse-dot 1s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .ad-status-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.06em;
          color: rgba(232,228,220,0.35);
        }
        .ad-status-text.ready { color: rgba(92,184,92,0.7); }
        .ad-status-text.done { color: rgba(201,162,39,0.7); }

        .ad-task {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #c9a227;
          margin-bottom: 16px;
          letter-spacing: 0.04em;
        }

        .ad-progress-wrap {
          margin-bottom: 12px;
        }
        .ad-progress-bg {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
        }
        .ad-progress-fill {
          position: absolute;
          top: 0; left: 0;
          height: 100%;
          background: #c9a227;
          transition: width 0.5s ease;
        }
        .ad-progress-nums {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .ad-progress-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(232,228,220,0.3);
          letter-spacing: 0.06em;
        }
        .ad-progress-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #c9a227;
          letter-spacing: 0.04em;
        }

        /* Run button */
        .ad-btn-run {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid rgba(201,162,39,0.4);
          color: rgba(201,162,39,0.7);
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 14px 28px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 32px;
          border-radius: 2px;
        }
        .ad-btn-run:hover:not(:disabled) {
          background: rgba(201,162,39,0.08);
          border-color: #c9a227;
          color: #c9a227;
        }
        .ad-btn-run:disabled {
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }
        .ad-btn-icon {
          font-size: 14px;
          line-height: 1;
        }

        /* Series Grid */
        .ad-section-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.25);
          margin-bottom: 20px;
        }

        .ad-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.04);
        }
        .ad-card {
          background: #0d0d0d;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: background 0.15s;
        }
        .ad-card:hover { background: #111111; }
        .ad-card-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #c9a227;
          letter-spacing: 0.06em;
          min-width: 44px;
        }
        .ad-card-divider {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .ad-card-name {
          font-size: 12px;
          font-weight: 300;
          color: rgba(232,228,220,0.45);
          letter-spacing: 0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .ad-root { flex-direction: column; }
          .ad-sidebar {
            width: 100%;
            min-width: unset;
            height: auto;
            position: static;
            padding: 28px 24px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .ad-main { height: auto; padding: 32px 20px 48px; }
          .ad-panel { padding: 28px 24px; }
          .ad-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ad-root">

        {/* ── Sidebar ── */}
        <aside className="ad-sidebar">
          <div className="ad-logo">OP<span>·</span>TRACKER</div>

          <nav className="ad-nav">
            <p className="ad-nav-label">Navigation</p>
          </nav>

          <div className="ad-sidebar-footer">
            <Link href="/">Home</Link>
            <Link href="/admin/boxes">Boxes</Link>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="ad-main">

          <header className="ad-header">
            <div>
              <h1 className="ad-header-title">SPIDER<span>·</span>CONTROLLER</h1>
              <p className="ad-header-sub">Master Scraper Dashboard</p>
            </div>
            <Link href="/" className="ad-btn-back">« Home</Link>
          </header>

          {/* System Panel */}
          <section className="ad-panel">
            <p className="ad-panel-label">System Status</p>

            {loading ? (
              <>
                <div className="ad-status-idle" style={{ marginBottom: 20 }}>
                  <div className="ad-dot working" />
                  <span className="ad-status-text">{currentTask}</span>
                </div>
                <div className="ad-progress-wrap">
                  <div className="ad-progress-bg">
                    <div className="ad-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="ad-progress-nums">
                    <span className="ad-progress-count">{statusMsg}</span>
                    <span className="ad-progress-pct">{Math.round(progressPct)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="ad-status-idle">
                <div className={`ad-dot${currentTask === "[ COMPLETED ]" ? " working" : ""}`}
                     style={currentTask === "[ COMPLETED ]" ? { background: '#c9a227', animation: 'none' } : {}} />
                <span className={`ad-status-text ${currentTask === "[ COMPLETED ]" ? "done" : "ready"}`}>
                  {currentTask === "[ COMPLETED ]"
                    ? "[ UPDATE COMPLETE — SYSTEM STANDBY ]"
                    : "[ SYSTEM READY ]"}
                </span>
              </div>
            )}

            <button
              onClick={runMasterScraper}
              disabled={loading || series.length === 0}
              className="ad-btn-run"
            >
              <span className="ad-btn-icon">◈</span>
              {loading ? "Initializing…" : "Run Master Scraper"}
            </button>
          </section>

          {/* Series List */}
          {series.length > 0 && (
            <>
              <p className="ad-section-label">Loaded Series — {series.length} sets</p>
              <div className="ad-grid">
                {series.map((item) => (
                  <div key={item.code} className="ad-card">
                    <span className="ad-card-code">{item.code}</span>
                    <div className="ad-card-divider" />
                    <span className="ad-card-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}