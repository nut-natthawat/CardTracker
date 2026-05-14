import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = 'https://onepiece.limitlesstcg.com';
  const fetchOptions = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebkit/537.36' }
  };

  try {
    const mainRes = await fetch(`${baseUrl}/cards`, fetchOptions);
    const mainHtml = await mainRes.text();
    const $main = cheerio.load(mainHtml);

    const allSeriesLinks: string[] = [];
    
    $main('table tbody tr').each((_, el) => {
      const link = $main(el).find('td:nth-child(2) a').attr('href');
      if (link) {
        allSeriesLinks.push(`${baseUrl}${link}`);
      }
    });

    console.log(`พบทั้งหมด ${allSeriesLinks.length} ซีรีส์ (OP, EB, PRB)`);

    let totalSaved = 0;
    const batchSize = 10; 
    const selectedSeries = allSeriesLinks.slice(0, batchSize);

    for (const sUrl of selectedSeries) {
      const sRes = await fetch(sUrl, fetchOptions);
      const sHtml = await sRes.text();
      const $s = cheerio.load(sHtml);

      const cardLinks: string[] = [];
      $s('.card-search-grid a').each((_, el) => {
        const cLink = $s(el).attr('href');
        if (cLink) cardLinks.push(`${baseUrl}${cLink}`);
      });
      for (const cUrl of cardLinks.slice(0, 10)) { 
        const cRes = await fetch(cUrl, fetchOptions);
        const cHtml = await cRes.text();
        const $c = cheerio.load(cHtml);

        const name = $c('.card-text-name a').text().trim();
        const cardNumber = $c('.card-text-id').text().trim();
        let imageUrl = $c('.card-image img').attr('src');
        if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `${baseUrl}${imageUrl}`;

        const priceText = $c('.card-buy-button.usd').text().trim();
        const priceMatch = priceText.match(/\$([0-9.]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

        if (name && imageUrl) {
          const card = await prisma.card.upsert({
            where: { imageUrl: imageUrl },
            update: { name, cardNumber },
            create: { name, series: 'One Piece', imageUrl, cardNumber }
          });

          await prisma.priceHistory.create({
            data: { cardId: card.id, price, sourceUrl: cUrl }
          });
          totalSaved++;
        }
      }
    }

    return NextResponse.json({
      status: "success",
      message: `บันทึกข้อมูลจาก ${selectedSeries.length} ซีรีส์ รวมทั้งหมด ${totalSaved} ใบเรียบร้อย!`,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'บอททำงานขัดข้อง' }, { status: 500 });
  }
}