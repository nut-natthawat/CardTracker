import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const series = searchParams.get('series') || '';
    const sort = searchParams.get('sort') || 'price_high';
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 40;
    const skip = (page - 1) * pageSize;

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { cardNumber: { contains: q, mode: 'insensitive' } },
              ],
            },
            series ? { series: { contains: series, mode: 'insensitive' } } : {},
          ],
        },
        orderBy: sort === 'price_low' 
          ? { [ 'currentPrice' as any ]: 'asc' } 
          : { [ 'currentPrice' as any ]: 'desc' },
        skip: skip,
        take: pageSize,
      }),
      prisma.card.count({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { cardNumber: { contains: q, mode: 'insensitive' } },
              ],
            },
            series ? { series: { contains: series, mode: 'insensitive' } } : {},
          ],
        },
      })
    ]);

    return NextResponse.json({ 
      cards: cards as any[], 
      totalPages: Math.ceil(total / pageSize),
      currentPage: page 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}