'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SERIES_LIST = [
{ id: '', name: 'ทั้งหมด (All Series)' },
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
  { id: 'PRB' , name: 'PRB-01 The Best' },
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
      alert(`บันทึก ${seriesCode} สำเร็จ!`);
      fetchData();
    } else {
      alert('Error');
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">จัดการราคากล่อง / ซอง</h1>
          <Link href="/" className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">กลับหน้าหลัก</Link>
        </div>

        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">รหัส / ชื่อชุด</th>
                <th className="px-6 py-4">ราคากล่อง (฿)</th>
                <th className="px-6 py-4">ราคาซอง (฿)</th>
                <th className="px-6 py-4">URL รูปกล่อง</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {SERIES_LIST.map((s) => {
                const info = dbInfo.find(db => db.seriesCode === s.id) || {};
                return (
                  <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-yellow-500 text-base">{s.id}</span>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">{s.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <input id={`boxPrice-${s.id}`} type="number" defaultValue={info.boxPrice || 0} className="w-28 bg-slate-900 border border-slate-600 rounded px-3 py-2 outline-none focus:border-yellow-500 transition-colors" />
                    </td>
                    <td className="px-6 py-4">
                      <input id={`packPrice-${s.id}`} type="number" defaultValue={info.packPrice || 0} className="w-28 bg-slate-900 border border-slate-600 rounded px-3 py-2 outline-none focus:border-yellow-500 transition-colors" />
                    </td>
                    <td className="px-6 py-4">
                      <input id={`boxImg-${s.id}`} type="text" defaultValue={info.boxImageUrl || ''} placeholder="Link รูปกล่อง..." className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 outline-none focus:border-yellow-500 transition-colors text-xs" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleSave(s.id, s.name)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition-all shadow-lg active:scale-95">บันทึก</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}