'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SERIES_LIST = [
  { id: '', name: 'All Series' },
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
  { id: 'PRB01', name: 'PRB-01 The Best vol1' },
  { id: 'PRB02', name: 'PRB-02 The Best vol2' },
];

export default function HomePage() {
  const [cards, setCards] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState('');
  const [rarity, setRarity] = useState('');
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
      const res = await fetch(`/api/cards?q=${query}&series=${series}&rarity=${rarity}&sort=${sort}&page=${page}`);
      const data = await res.json();
      setCards(data.cards || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchCards(), 500);
    return () => clearTimeout(delay);
  }, [query, series, rarity, sort, page]);

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-[#e8e4dc] font-sans">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0d0d0d] border-r border-white/5 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar z-20">
        <div className="font-serif text-xl font-bold tracking-[0.15em] text-[#e8e4dc] uppercase">
          OP<span className="text-[#c9a227]">·</span>TRACKER
        </div>

        <div className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Search cards..."
            className="bg-transparent border-b border-white/20 py-2 text-sm outline-none focus:border-[#c9a227] transition-colors placeholder:text-white/20"
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />

          <select
            className="bg-transparent border-b border-white/10 py-2 text-[11px] uppercase tracking-wider text-white/40 outline-none cursor-pointer focus:border-[#c9a227]"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="price_high" className="bg-[#121212]">Price Descending</option>
            <option value="price_low" className="bg-[#121212]">Price Ascending</option>
          </select>

          <select
            className="bg-transparent border-b border-white/10 py-2 text-[11px] uppercase tracking-wider text-white/40 outline-none cursor-pointer focus:border-[#c9a227]"
            value={rarity}
            onChange={(e) => { setRarity(e.target.value); setPage(1); }}
          >
            <option value="" className="bg-[#121212]">All Rarities</option>
            <option value="AA" className="bg-[#121212]">Alternate Art (AA)</option>
            <option value="Manga" className="bg-[#121212]">Manga / Special</option>
            <option value="Leader" className="bg-[#121212]">Leader Cards</option>
            <option value="Base" className="bg-[#121212]">Base Cards</option>
          </select>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-4 font-semibold">Series List</p>
          {SERIES_LIST.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSeries(s.id); setPage(1); }}
              className={`text-left py-1.5 text-xs transition-colors truncate ${
                series === s.id ? 'text-[#c9a227] font-medium' : 'text-white/40 hover:text-white/80'
              }`}
            >
              {s.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 flex gap-4 border-t border-white/5">
          <Link href="/login" className="text-[10px] uppercase tracking-widest text-white/20 hover:text-[#c9a227]">Admin</Link>
          <Link href="/admin/boxes" className="text-[10px] uppercase tracking-widest text-white/20 hover:text-emerald-500">Boxes</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12 overflow-y-auto h-screen custom-scrollbar">
        {/* Box Banner */}
        {series !== '' && boxInfo && (
          <div className="mb-14 pb-10 border-b border-white/10 flex items-center gap-10 animate-in fade-in duration-700">
            {boxInfo.boxImageUrl && (
              <div className="w-24 h-32 flex-none overflow-hidden">
                <img src={boxInfo.boxImageUrl} alt="Box" className="w-full h-full object-contain grayscale-[0.3] brightness-90" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Booster Box Statistics</p>
              <h2 className="font-serif text-3xl font-semibold mb-6 tracking-wide italic">
                {boxInfo.name || SERIES_LIST.find(s => s.id === series)?.name}
              </h2>
              <div className="flex gap-10">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 mb-1">Market Price (Box)</p>
                  <p className="font-mono text-xl text-[#c9a227]">{boxInfo.boxPrice > 0 ? `฿${boxInfo.boxPrice.toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 mb-1">Average (Pack)</p>
                  <p className="font-mono text-xl text-[#c9a227]">{boxInfo.packPrice > 0 ? `฿${boxInfo.packPrice.toLocaleString()}` : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border border-white/10 border-t-[#c9a227] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-8">
              {cards.map((card) => (
                <div key={card.id} className="group flex flex-col gap-4">
                  <div className="aspect-[5/7] bg-[#161616] overflow-hidden">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 grayscale-[0.2] group-hover:grayscale-0" 
                      loading="lazy" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[9px] text-white/20 tracking-widest">{card.cardNumber}</span>
                      {card.rarity && card.rarity !== "Base" && (
                        <span className="text-[8px] uppercase tracking-tighter border border-white/10 px-1.5 py-0.5 rounded text-white/40">{card.rarity}</span>
                      )}
                    </div>
                    <h3 className="text-[11px] font-medium text-white/60 line-clamp-2 leading-relaxed min-h-[2.8rem] group-hover:text-white transition-colors">{card.name}</h3>
                    <p className="font-mono text-sm text-[#c9a227] mt-1">
                      {card.currentPrice > 0 ? `฿${(card.currentPrice * 36).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-20 pt-8 border-t border-white/5 flex items-center justify-center gap-4">
              <button disabled={page === 1} onClick={() => {setPage(1); document.querySelector('main')?.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-white/20 hover:text-[#c9a227] disabled:opacity-0 transition-colors">«</button>
              <button disabled={page === 1} onClick={() => {setPage(page-1); document.querySelector('main')?.scrollTo({top:0, behavior:'smooth'})}} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-0 transition-colors">Prev</button>
              <span className="font-mono text-[10px] text-white/20 px-4">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => {setPage(page+1); document.querySelector('main')?.scrollTo({top:0, behavior:'smooth'})}} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-0 transition-colors">Next</button>
              <button disabled={page === totalPages} onClick={() => {setPage(totalPages); document.querySelector('main')?.scrollTo({top:0, behavior:'smooth'})}} className="p-2 text-white/20 hover:text-[#c9a227] disabled:opacity-0 transition-colors">»</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}