'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SERIES_LIST = [
  { id: 'OP01', name: 'OP-01 Romance Dawn' },
  { id: 'OP02', name: 'OP-02 Paramount War' },
  { id: 'OP03', name: 'OP-03 Pillars of Strength' },
  { id: 'OP04', name: 'OP-04 Kingdoms of Intrigue' },
  { id: 'OP05', name: 'OP-05 Awakening of the New Era' },
  { id: 'OP06', name: 'OP-06 Wings of the Captain' },
  { id: 'OP07', name: 'OP-07 500 Years in the Future' },
  { id: 'OP08', name: 'OP-08 Two Legends' },
  { id: 'OP09', name: 'OP-09 The New Emperor' },
  { id: 'OP10', name: 'OP-10 Royal Blood' },
  { id: 'OP11', name: 'OP-11 A Fist of Divine Speed' },
  { id: 'OP12', name: 'OP-12 Legacy of the Master' },
  { id: 'OP13', name: 'OP-13 Carrying on His Will' },
  { id: 'OP14', name: 'OP-14 The Azure Seas Seven' },
  { id: 'OP15', name: 'OP-15 Adventure on Kamis Island' },
  { id: 'EB01', name: 'EB-01 Memorial Collection' },
  { id: 'EB02', name: 'EB-02 Anime 25th Collection' },
  { id: 'EB03', name: 'EB-03 One Piece Heroines Edition' },
  { id: 'PRB01' , name: 'PRB-01 The Best vol1' },
  { id: 'PRB02' , name: 'PRB-02 The Best vol2' },
];

export default function AdminBoxesPage() {
  const [dbInfo, setDbInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch('/api/series-info');
    if (res.ok) {
      const data = await res.json();
      setDbInfo(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (seriesCode: string, name: string) => {
    const boxImg = (document.getElementById(`boxImg-${seriesCode}`) as HTMLInputElement).value;
    const boxPrice = (document.getElementById(`boxPrice-${seriesCode}`) as HTMLInputElement).value;
    const packPrice = (document.getElementById(`packPrice-${seriesCode}`) as HTMLInputElement).value;

    const res = await fetch('/api/series-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesCode, name, boxImageUrl: boxImg, boxPrice, packPrice })
    });

    if (res.ok) {
      alert(`[ SUCCESS ] บันทึกข้อมูล ${seriesCode} เรียบร้อยแล้ว!`);
      fetchData();
    } else {
      alert('[ ERROR ] เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0d0d0d]">
      <p className="text-[#c9a227] tracking-widest text-sm uppercase">Loading Data...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        .ab-root {
          min-height: 100vh;
          background: #0d0d0d;
          color: #e8e4dc;
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
          padding: 48px 5%;
        }

        .ab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 24px;
          margin-bottom: 48px;
        }

        .ab-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #e8e4dc;
          text-transform: uppercase;
        }
        .ab-title span { color: #c9a227; }

        .ab-header-actions {
          display: flex;
          gap: 16px;
        }

        .ab-btn-back {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.5);
          text-decoration: none;
          padding: 10px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          transition: all 0.2s;
        }
        .ab-btn-back:hover {
          color: #c9a227;
          border-color: #c9a227;
        }

        /* Panel & Table */
        .ab-panel {
          background: #121212;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 64px;
        }

        .ab-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 800px;
        }
        .ab-table th {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.3);
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-weight: 400;
        }
        .ab-table td {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        .ab-table tr:hover { background: rgba(255,255,255,0.02); }
        
        .ab-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #c9a227;
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .ab-name {
          font-size: 12px;
          color: rgba(232,228,220,0.5);
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        /* Inputs */
        .ab-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          color: #e8e4dc;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          padding: 8px 4px;
          width: 100px;
          outline: none;
          transition: border-color 0.2s;
        }
        .ab-input.long {
          width: 100%;
          min-width: 200px;
          font-family: 'Outfit', sans-serif;
        }
        .ab-input:focus { border-bottom-color: #c9a227; }
        .ab-input::placeholder { color: rgba(232,228,220,0.15); font-family: 'Outfit', sans-serif;}

        /* Action Button */
        .ab-btn-save {
          background: transparent;
          border: 1px solid rgba(201,162,39, 0.4);
          color: #c9a227;
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ab-btn-save:hover {
          background: #c9a227;
          color: #0d0d0d;
          font-weight: 500;
          border-color: #c9a227;
        }
      `}</style>

      <div className="ab-root">
        <header className="ab-header">
          <h1 className="ab-title">BOX INFO<span>·</span>MANAGER</h1>
          <div className="ab-header-actions">
            <Link href="/login" className="ab-btn-back" style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>Spider Control</Link>
            <Link href="/" className="ab-btn-back">« Back to Home</Link>
          </div>
        </header>

        <section className="ab-panel custom-scrollbar">
          <table className="ab-table">
            <thead>
              <tr>
                <th>Series Code</th>
                <th>Box Price (฿)</th>
                <th>Pack Price (฿)</th>
                <th>Box Image URL</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {SERIES_LIST.map((s) => {
                const info = dbInfo.find(db => db.seriesCode === s.id) || {};
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="ab-code">{s.id}</span>
                      <span className="ab-name" title={s.name}>{s.name}</span>
                    </td>
                    <td>
                      <input 
                        id={`boxPrice-${s.id}`} 
                        type="number" 
                        defaultValue={info.boxPrice || 0} 
                        className="ab-input" 
                      />
                    </td>
                    <td>
                      <input 
                        id={`packPrice-${s.id}`} 
                        type="number" 
                        defaultValue={info.packPrice || 0} 
                        className="ab-input" 
                      />
                    </td>
                    <td>
                      <input 
                        id={`boxImg-${s.id}`} 
                        type="text" 
                        defaultValue={info.boxImageUrl || ''} 
                        placeholder="https://..." 
                        className="ab-input long" 
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleSave(s.id, s.name)} 
                        className="ab-btn-save"
                      >
                        Save Data
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}