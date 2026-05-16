import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const series = searchParams.get('series') || '';
    const rarity = searchParams.get('rarity') || ''; 
    const sort = searchParams.get('sort') || 'price_high';
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 40;
    const skip = (page - 1) * pageSize;

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

    if (series) {
      whereClause.AND.push({ series: { contains: series, mode: 'insensitive' } });
    }

    if (rarity) {
      if (rarity === 'Base') {
        whereClause.AND.push({ rarity: { equals: 'Base' } });
      } else {
        whereClause.AND.push({ rarity: { contains: rarity, mode: 'insensitive' } });
      }
    }

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