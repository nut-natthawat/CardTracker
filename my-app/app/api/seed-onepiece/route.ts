import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSeries = searchParams.get('series') || 'op15-adventure-on-kamis-island';
    const formattedSeries = targetSeries.split('-')[0].toUpperCase(); 

    const baseUrl = 'https://onepiece.limitlesstcg.com';
    const seriesUrl = `${baseUrl}/cards/${targetSeries}`;
    
    const fetchOptions = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    };

    const mainRes = await fetch(seriesUrl, fetchOptions);
    const mainHtml = await mainRes.text();
    const $main = cheerio.load(mainHtml);

    const cardLinks: string[] = [];
    $main('.card-search-grid a').each((_, element) => {
      const href = $main(element).attr('href');
      if (href) cardLinks.push(`${baseUrl}${href}`);
    });

    if (cardLinks.length === 0) {
      return NextResponse.json({ error: `ไม่พบการ์ดในซีรีส์: ${targetSeries}` });
    }

    const scrapedData = [];

    for (const link of cardLinks) {
      const cardRes = await fetch(link, fetchOptions);
      const cardHtml = await cardRes.text();
      const $ = cheerio.load(cardHtml);

      const name = $('.card-text-name a').text().trim();
      const cardNumber = $('.card-text-id').text().trim();
      let imageUrl = $('.card-image img').attr('src');
      if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `${baseUrl}${imageUrl}`;

      const priceText = $('.card-buy-button.usd').text().trim();
      const cleanPriceText = priceText.replace(/,/g, ''); 
      const priceMatch = cleanPriceText.match(/\$([0-9.]+)/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

      if (name && imageUrl) {
        const existingCard = await prisma.card.findUnique({
          where: { imageUrl: imageUrl }
        });

        let currentCardId;

        if (existingCard) {
          let updatedSeries = existingCard.series;
          if (!updatedSeries.includes(formattedSeries)) {
            updatedSeries = `${existingCard.series}, ${formattedSeries}`; 
          }

          const card = await prisma.card.update({
            where: { id: existingCard.id },
            data: { 
              currentPrice: price, 
              series: updatedSeries 
            }
          });
          currentCardId = card.id;
          scrapedData.push({ name, cardNumber, price, series: updatedSeries, status: 'Updated' });

        } else {
          const card = await prisma.card.create({
            data: { 
              name, 
              series: formattedSeries, 
              imageUrl, 
              cardNumber,
              currentPrice: price
            }
          });
          currentCardId = card.id;
          scrapedData.push({ name, cardNumber, price, series: formattedSeries, status: 'Created' });
        }

        await prisma.priceHistory.create({
          data: { cardId: currentCardId, price, sourceUrl: link }
        });
      }
    }

    return NextResponse.json({
      message: `บันทึกซีรีส์ ${targetSeries} สำเร็จ ${scrapedData.length} ใบ`,
      savedSeriesAs: formattedSeries,
      data: scrapedData
    });

  } catch (error) {
    console.error("Bot Error:", error);
    return NextResponse.json({ error: 'บอททำงานขัดข้อง' }, { status: 500 });
  }
}