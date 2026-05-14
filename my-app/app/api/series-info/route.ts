import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (code) {
      const info = await prisma.seriesInfo.findUnique({ where: { seriesCode: code } });
      return NextResponse.json(info || null);
    }
    
    const allInfo = await prisma.seriesInfo.findMany();
    return NextResponse.json(allInfo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seriesCode, name, boxImageUrl, packImageUrl, boxPrice, packPrice } = body;
    
    const upserted = await prisma.seriesInfo.upsert({
      where: { seriesCode },
      update: { 
        name, 
        boxImageUrl, 
        packImageUrl, 
        boxPrice: Number(boxPrice), 
        packPrice: Number(packPrice) 
      },
      create: { 
        seriesCode, 
        name, 
        boxImageUrl, 
        packImageUrl, 
        boxPrice: Number(boxPrice), 
        packPrice: Number(packPrice) 
      }
    });
    
    return NextResponse.json(upserted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}