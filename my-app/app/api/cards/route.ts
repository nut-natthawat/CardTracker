import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const series = searchParams.get('series') || '';
    const rarity = searchParams.get('rarity') || ''; // 👈 ดึงค่า rarity ที่ส่งมาจากหน้าบ้าน
    const sort = searchParams.get('sort') || 'price_high';
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 40;
    const skip = (page - 1) * pageSize;

    // 🛠️ สร้างเงื่อนไข Query Filter ของ Prisma
    const whereClause: any = {
      AND: [
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { cardNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
      ]
    };

    // 1. กรองตามซีรีส์ (ถ้ามีการเลือก)
    if (series) {
      whereClause.AND.push({ series: { contains: series, mode: 'insensitive' } });
    }

    // 2. กรองตามความแรร์ (ถ้ามีการเลือก)
    if (rarity) {
      if (rarity === 'Base') {
        // 🚨 กฎเหล็ก: ถ้าเลือก Base ต้องเอาเฉพาะที่ช่อง rarity เท่ากับ "Base" เป๊ะๆ เท่านั้น
        // วิธีนี้จะช่วยกันไม่ให้พวก "Manga / SP" หรือ "AA" หลุดเข้ามาเด็ดขาด
        whereClause.AND.push({ rarity: { equals: 'Base' } });
      } else {
        // สำหรับความแรร์อื่นๆ (เช่น AA, Manga, Promo) ใช้ contains เผื่อกรณีข้อความยาวได้
        whereClause.AND.push({ rarity: { contains: rarity, mode: 'insensitive' } });
      }
    }

    // ดึงข้อมูลการ์ดและนับจำนวนหน้าพร้อมกัน
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: whereClause,
        orderBy: sort === 'price_low' 
          ? { currentPrice: 'asc' } 
          : { currentPrice: 'desc' },
        skip: skip,
        take: pageSize,
      }),
      prisma.card.count({
        where: whereClause,
      })
    ]);

    return NextResponse.json({ 
      cards: cards, 
      totalPages: Math.ceil(total / pageSize),
      currentPage: page 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}