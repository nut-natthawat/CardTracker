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
  { id: 'OP11', name: 'OP-11' },
  { id: 'OP12', name: 'OP-12' },
  { id: 'OP13', name: 'OP-13' },
  { id: 'OP14', name: 'OP-14' },
  { id: 'OP15', name: 'OP-15 Adventure on Kamis Island' },
  { id: 'EB01', name: 'EB-01 Memorial Collection' },
  { id: 'EB02', name: 'EB-02 Anime 25th Collection' },
  { id: 'PRB01', name: 'PRB-01 The Best vol1' },
];

const RARITY_OPTIONS = ["Base", "AA", "Manga", "SP", "TR", "Leader", "SEC", "SR", "R", "UC", "C", "Promo"];

export default function AdminCardsEditor() {
  const [series, setSeries] = useState(SERIES_LIST[0].id);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchCards = async (selectedSeries: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cards?series=${selectedSeries}`);
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards(series);
  }, [series]);

  // ฟังก์ชันอัปเดตแบบ Auto-save
  const handleRarityChange = async (cardId: string, newRarity: string) => {
    setSavingId(cardId);
    try {
      await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cardId, rarity: newRarity })
      });
      
      // อัปเดต state ทันทีเพื่อให้ UI เปลี่ยนโดยไม่ต้องโหลดใหม่
      setCards(cards.map(c => c.id === cardId ? { ...c, rarity: newRarity } : c));
    } catch (err) {
      alert("เซฟไม่สำเร็จ ลองใหม่อีกครั้งครับ");
    }
    setSavingId(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e8e4dc] font-sans p-8 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-widest uppercase text-[#e8e4dc]">
          RARITY<span className="text-[#c9a227]">·</span>EDITOR
        </h1>
        <div className="flex gap-4">
          <Link href="/login" className="text-[11px] tracking-[0.12em] uppercase text-white/40 border border-white/10 px-4 py-2 rounded transition-all hover:text-[#c9a227]">
            Spider Control
          </Link>
          <Link href="/admin/boxes" className="text-[11px] tracking-[0.12em] uppercase text-white/40 border border-white/10 px-4 py-2 rounded transition-all hover:text-[#c9a227]">
            Boxes Manager
          </Link>
          <Link href="/" className="text-[11px] tracking-[0.12em] uppercase text-white/60 border border-white/20 px-4 py-2 rounded transition-all hover:text-[#c9a227]">
            « Back to Home
          </Link>
        </div>
      </header>

      {/* แถบเลือกชุดการ์ด */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-lg mb-8 shadow-2xl flex items-center gap-6">
        <span className="text-[11px] uppercase tracking-widest text-white/40">Select Series:</span>
        <select 
          className="bg-transparent border-b border-white/20 text-[#c9a227] text-sm py-2 px-4 outline-none focus:border-[#c9a227] cursor-pointer"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
        >
          {SERIES_LIST.map(s => <option key={s.id} value={s.id} className="bg-[#121212]">{s.name}</option>)}
        </select>
        <span className="ml-auto text-[11px] font-mono text-white/30">Total: {cards.length} cards</span>
      </div>

      {/* Grid แสดงการ์ดทั้งหมด */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#c9a227] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {cards.map((card) => (
            <div key={card.id} className={`bg-[#161616] border rounded-lg p-3 flex flex-col gap-3 transition-all ${savingId === card.id ? 'border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.3)]' : 'border-white/5'}`}>
              <div className="aspect-[5/7] overflow-hidden rounded bg-black relative">
                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                {savingId === card.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-[#c9a227] text-[10px] uppercase font-bold tracking-widest">Saving...</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-[#c9a227]">{card.cardNumber}</span>
                <span className="text-[10px] text-white/50 truncate" title={card.name}>{card.name}</span>
                
                {/* 🌟 Dropdown เลือกระดับความแรร์ (เปลี่ยนปุ๊บ เซฟปั๊บ) 🌟 */}
                <select 
                  className="mt-2 w-full bg-[#0d0d0d] border border-white/10 text-white/80 text-[11px] p-1.5 rounded outline-none focus:border-[#c9a227] cursor-pointer"
                  value={card.rarity || "Base"}
                  onChange={(e) => handleRarityChange(card.id, e.target.value)}
                  disabled={savingId === card.id}
                >
                  {RARITY_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}