import { prisma } from '@/lib/prisma';

// หน้าเว็บนี้เป็น Server Component ดึงข้อมูลตรงจาก DB ได้เลย
export default async function Home() {
  // ดึงข้อมูลการ์ดทั้งหมด พร้อมประวัติราคาล่าสุด 1 รายการ
  const cards = await prisma.card.findMany({
    include: {
      prices: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <main className="min-h-screen p-8 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-slate-800">
          TCG Price Tracker
        </h1>
        
        {/* จัด Layout แบบ Grid ให้ Responsive (ยืดหยุ่นตามขนาดจอ) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* รูปภาพการ์ด - จัดให้สัดส่วนภาพพอดีกับกรอบเสมอ */}
              <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                {card.imageUrl ? (
                  <img 
                    src={card.imageUrl} 
                    alt={card.name} 
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="p-8 text-gray-400">No Image</div>
                )}
              </div>
              
              {/* ข้อมูลและราคา */}
              <div className="mt-4">
                <h2 className="text-lg font-bold text-slate-800 truncate" title={card.name}>
                  {card.name}
                </h2>
                <p className="text-xs text-slate-500 mb-2">
                  {card.series} • {card.cardNumber}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm text-slate-500">Market Price</span>
                  <span className="text-lg font-extrabold text-green-600">
                    ฿{((card.prices[0]?.price || 0) * 36).toLocaleString('th-TH', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}