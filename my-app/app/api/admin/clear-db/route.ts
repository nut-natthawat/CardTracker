import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const deletePrices = await prisma.priceHistory.deleteMany({});
    const deleteCards = await prisma.card.deleteMany({});

    return NextResponse.json({ 
      message: "ล้างฐานข้อมูลเรียบร้อย! ✨",
      deletedPrices: deletePrices.count,
      deletedCards: deleteCards.count
    });
  } catch (error: any) {
    return NextResponse.json({ error: "ลบไม่สำเร็จ", details: error.message }, { status: 500 });
  }
}