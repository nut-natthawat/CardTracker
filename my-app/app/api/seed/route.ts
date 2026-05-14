import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const res = await fetch('https://api.pokemontcg.io/v2/cards?pageSize=10');
    const data = await res.json();
    const pokemonCards = data.data;

    let savedCount = 0;

    for (const card of pokemonCards) {
      const existingCard = await prisma.card.findFirst({
        where: { cardNumber: card.id }
      });

      if (!existingCard) {
        const newCard = await prisma.card.create({
          data: {
            name: card.name,
            series: 'Pokemon',
            imageUrl: card.images.small, 
            cardNumber: card.id,
          }
        });

        const price = card.tcgplayer?.prices?.holofoil?.market || card.tcgplayer?.prices?.normal?.market || 0;
        
        await prisma.priceHistory.create({
          data: {
            cardId: newCard.id,
            price: price,
            sourceUrl: card.tcgplayer?.url || 'https://tcgplayer.com'
          }
        });
        
        savedCount++;
      }
    }

    return NextResponse.json({ message: `บันทึกการ์ดใหม่สำเร็จ ${savedCount} ใบ!` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}