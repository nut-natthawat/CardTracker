'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch('/api/get-series').then(res => res.json()).then(data => setSeries(data));
  }, []);

  const runMasterScraper = async () => {
    if (!confirm("ต้องการเริ่มดูดข้อมูลทุกซีรีส์ใช่หรือไม่? (อาจใช้เวลาหลายนาที)")) return;
    
    setLoading(true);
    let count = 0;

    for (const item of series) {
      setCurrentTask(`กำลังดึงข้อมูลชุด: ${item.code} - ${item.name}`);
      
      try {
        const res = await fetch(`/api/seed-onepiece?series=${item.url}&limit=100`);
        const result = await res.json();
        
        count++;
        setStatusMsg(`สำเร็จไปแล้ว ${count} / ${series.length} ชุด`);
      } catch (err) {
        console.error(`ชุด ${item.code} พัง:`, err);
      }
    }
    setLoading(false);
    setCurrentTask("เสร็จสมบูรณ์!");
    alert("บอททำงานเสร็จสิ้น ข้อมูล One Piece เต็มคลังแล้วครับ!");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Spider Controller 🕷️</h1>
      
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-8">
        <h2 className="text-xl mb-4">สถานะการทำงาน</h2>
        {loading ? (
          <div className="animate-pulse">
            <p className="text-yellow-300 font-mono mb-2">{currentTask}</p>
            <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full transition-all duration-500" 
                   style={{ width: `${(series.indexOf(series.find(s => s.name === currentTask.split(': ')[1])) / series.length) * 100}%` }}>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">{statusMsg}</p>
          </div>
        ) : (
          <p className="text-green-400">ระบบพร้อมใช้งาน</p>
        )}

        <button 
          onClick={runMasterScraper}
          disabled={loading || series.length === 0}
          className="mt-6 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 px-8 py-3 rounded-lg font-bold transition-colors"
        >
          {loading ? "กำลังทำงาน..." : "🚀 เริ่มดูดข้อมูลทุกล่วง (Master Run)"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((item) => (
          <div key={item.code} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
            <div>
              <span className="text-yellow-500 font-bold mr-2">{item.code}</span>
              <span className="text-slate-300 text-sm">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}