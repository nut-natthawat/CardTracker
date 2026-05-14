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

export default function HomePage() {
  const [cards, setCards] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState('');
  const [sort, setSort] = useState('price_high');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [boxInfo, setBoxInfo] = useState<any>(null);

  useEffect(() => {
    if (series !== '') {
      fetch(`/api/series-info?code=${series}`)
        .then(res => res.json())
        .then(data => setBoxInfo(data))
        .catch(() => setBoxInfo(null));
    } else {
      setBoxInfo(null);
    }
  }, [series]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cards?q=${query}&series=${series}&sort=${sort}&page=${page}`);
      const data = await res.json();
      setCards(data.cards || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchCards(), 500);
    return () => clearTimeout(delay);
  }, [query, series, sort, page]);

  const handleFilterChange = (newSeries: string) => {
    setSeries(newSeries);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-72 bg-slate-800 p-6 border-r border-slate-700 flex flex-col gap-6 sticky top-0 md:h-screen overflow-y-auto z-10 custom-scrollbar">
        <h1 className="text-3xl font-black text-yellow-400 tracking-tighter drop-shadow-lg">OP TRACKER</h1>

        <input
          type="text"
          placeholder="ค้นหาการ์ด..."
          className="bg-slate-900 border border-slate-600 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none w-full transition-all"
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />

        <select
          className="bg-slate-900 border border-slate-600 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer w-full transition-all"
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
        >
          <option value="price_high">ราคา: แพงสุด</option>
          <option value="price_low">ราคา: ถูกสุด</option>
        </select>

        <nav className="flex flex-col gap-1 mt-2">
          {SERIES_LIST.map((s) => (
            <button
              key={s.id}
              onClick={() => handleFilterChange(s.id)}
              className={`px-4 py-3 text-left rounded-xl transition-all font-bold text-sm ${
                series === s.id ? 'bg-yellow-500 text-slate-900 scale-105 shadow-xl' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 flex justify-between border-t border-slate-700/50">
          <Link href="/login" className="text-[10px] text-slate-500 hover:text-yellow-500 uppercase font-bold tracking-widest">Admin</Link>
          <Link href="/admin/boxes" className="text-[10px] text-slate-500 hover:text-emerald-500 uppercase font-bold tracking-widest">Boxes</Link>
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col md:h-screen overflow-y-auto custom-scrollbar">
        
        {series !== '' && boxInfo && (
          <div className="mb-10 bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full"></div>
            
            {boxInfo.boxImageUrl && (
              <div className="flex-none w-48 min-w-[12rem] h-60 md:w-56 md:min-w-[14rem] md:h-72 bg-slate-950 rounded-2xl border border-slate-600/50 flex items-center justify-center overflow-hidden shadow-2xl group">
                <img src={boxInfo.boxImageUrl} alt="Box" className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
              </div>
            )}

            <div className="flex-1 min-w-0 text-center md:text-left z-10">
              <span className="text-yellow-500 font-black text-sm uppercase tracking-[0.2em] mb-2 block">BOOSTER BOX INFO</span>
              <h2 className="text-4xl font-black text-white mb-6 tracking-tight truncate">
                {boxInfo.name || SERIES_LIST.find(s => s.id === series)?.name}
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <div className="bg-slate-950/50 backdrop-blur-md px-8 py-5 rounded-2xl border-l-4 border-emerald-500 shadow-inner">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Market Price (Box)</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {boxInfo.boxPrice > 0 ? `฿${boxInfo.boxPrice.toLocaleString()}` : 'N/A'}
                  </p> 
                </div>
                
                <div className="bg-slate-950/50 backdrop-blur-md px-8 py-5 rounded-2xl border-l-4 border-blue-500 shadow-inner">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Market Price (Pack)</p>
                  <p className="text-3xl font-black text-blue-400">
                    {boxInfo.packPrice > 0 ? `฿${boxInfo.packPrice.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500"></div></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {cards.map((card: any) => (
                <div key={card.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-[0_0_40px_-15px_rgba(234,179,8,0.3)] flex flex-col group">
                  <div className="relative aspect-[2.5/3.5] overflow-hidden bg-slate-900">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow relative">
                    <span className="inline-block px-2 py-1 bg-slate-900 text-[10px] font-black text-slate-400 rounded-md mb-3 w-max border border-slate-700 uppercase tracking-tighter">{card.cardNumber}</span>
                    <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug mb-4 group-hover:text-yellow-400 transition-colors">{card.name}</h3>
                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Current</span>
                      <span className="text-emerald-400 font-black text-xl tracking-tighter">
                        {card.currentPrice > 0 ? `฿${(card.currentPrice * 36).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 mb-10 flex justify-center items-center gap-3">
              <button disabled={page === 1} onClick={() => { setPage(1); document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 bg-slate-800 rounded-xl disabled:opacity-20 hover:bg-slate-700 border border-slate-700 transition-all active:scale-90">«</button>
              <button disabled={page === 1} onClick={() => { setPage(page - 1); document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-5 py-3 bg-slate-800 rounded-xl disabled:opacity-20 hover:bg-slate-700 border border-slate-700 font-bold transition-all active:scale-90 text-sm">ย้อนกลับ</button>
              <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-700 font-black text-yellow-500 text-sm shadow-inner">{page} / {totalPages}</div>
              <button disabled={page === totalPages} onClick={() => { setPage(page + 1); document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-5 py-3 bg-slate-800 rounded-xl disabled:opacity-20 hover:bg-slate-700 border border-slate-700 font-bold transition-all active:scale-90 text-sm">ถัดไป</button>
              <button disabled={page === totalPages} onClick={() => { setPage(totalPages); document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 bg-slate-800 rounded-xl disabled:opacity-20 hover:bg-slate-700 border border-slate-700 transition-all active:scale-90">»</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}