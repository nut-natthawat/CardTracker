import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const series = searchParams.get('series');
    
    if (!series) return NextResponse.json([]);

    const cards = await prisma.card.findMany({
      where: { series: { contains: series, mode: 'insensitive' } },
      orderBy: { cardNumber: 'asc' } 
    });

    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, rarity } = await request.json();
    
    const updatedCard = await prisma.card.update({
      where: { id },
      data: { rarity }
    });

    return NextResponse.json({ success: true, rarity: updatedCard.rarity });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}