import { prisma } from '@/lib/prisma';
import SearchFilter from './components/SearchFilter';

// รับค่า searchParams จาก URL อัตโนมัติ
export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; box?: string };
}) {
  const query = searchParams?.q || '';
  const box = searchParams?.box || '';

  // 1. ดึงรายชื่อ Box/Series ทั้งหมดที่ไม่ซ้ำกันมาทำตัวเลือก Dropdown
  const uniqueBoxes = await prisma.card.findMany({
    select: { series: true },
    distinct: ['series'],
  });
  const boxList = uniqueBoxes.map((b) => b.series);

  // 2. ดึงการ์ดจาก Database ตามเงื่อนไขการค้นหา
  const cards = await prisma.card.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive', // ค้นหาได้ทั้งตัวพิมพ์เล็กและใหญ่ (ใช้ได้เฉพาะ PostgreSQL)
      },
      ...(box ? { series: box } : {}), // ถ้ามีการเลือก Box ถึงจะเพิ่มเงื่อนไขนี้
    },
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
        
        {/* เรียกใช้งานแถบค้นหาและส่งรายชื่อ Box ไปให้ */}
        <SearchFilter boxes={boxList} />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {cards.length > 0 ? (
            cards.map((card) => (
              <div 
                key={card.id} 
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
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
                
                <div className="mt-4">
                  <h2 className="text-lg font-bold text-slate-800 truncate" title={card.name}>
                    {card.name}
                  </h2>
                  <p className="text-xs text-slate-500 mb-2">
                    {card.series} • {card.cardNumber}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm text-slate-500">ราคาตลาด</span>
                    <span className="text-lg font-extrabold text-green-600">
                      ฿{((card.prices[0]?.price || 0) * 36).toLocaleString('th-TH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // กรณีค้นหาแล้วไม่เจอการ์ด
            <div className="col-span-full text-center py-10 text-slate-500 text-lg">
              ไม่พบการ์ดที่คุณค้นหา 😢
            </div>
          )}
        </div>
      </div>
    </main>
  );
}