import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

// 👇 สร้างฟังก์ชัน "พักหายใจ" ให้บอท
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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
    if (!mainRes.ok) throw new Error(`ไม่สามารถเข้าถึงหน้าชุดการ์ดได้ (Status: ${mainRes.status})`);
    
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
      try {
        const cardRes = await fetch(link, fetchOptions);
        if (!cardRes.ok) {
          console.warn(`[SKIP] โดนบล็อกหรือดึงไม่ได้ที่ลิงก์: ${link}`);
          continue; // ถ้าใบนี้พัง ให้ข้ามไปทำใบต่อไปเลย ไม่ต้องช็อต
        }

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

        // วิเคราะห์ความแรร์ (Rarity Heuristics)
        let cardRarity = "Base";
        const lowerImgUrl = imageUrl?.toLowerCase() || '';
        const lowerName = name.toLowerCase();

        if (lowerImgUrl.includes('_p1') || lowerImgUrl.includes('-p1')) {
          cardRarity = "AA";
        } else if (lowerImgUrl.includes('_p2') || lowerImgUrl.includes('-p2') || lowerImgUrl.includes('_p3') || lowerImgUrl.includes('-p3') || lowerImgUrl.includes('_p4')) {
          cardRarity = price > 100 ? "Manga / SP" : "AA";
        } else if (lowerImgUrl.includes('sp') || lowerName.includes('special')) {
          cardRarity = "SP";
        } else if (lowerImgUrl.includes('tr') || lowerName.includes('treasure')) {
          cardRarity = "TR";
        }

        if (cardNumber.includes('L') && cardRarity === "Base") {
          cardRarity = "Leader";
        } else if (cardNumber.startsWith('P-') || cardNumber.startsWith('ST')) {
          if (cardRarity === "Base") cardRarity = "Promo / ST";
        }

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
                series: updatedSeries,
                rarity: cardRarity
              }
            });
            currentCardId = card.id;
            scrapedData.push({ name, cardNumber, price, rarity: cardRarity, status: 'Updated' });

          } else {
            const card = await prisma.card.create({
              data: { 
                name, 
                series: formattedSeries, 
                imageUrl, 
                cardNumber,
                currentPrice: price,
                rarity: cardRarity
              }
            });
            currentCardId = card.id;
            scrapedData.push({ name, cardNumber, price, rarity: cardRarity, status: 'Created' });
          }

          await prisma.priceHistory.create({
            data: { cardId: currentCardId, price, sourceUrl: link }
          });
        }
      } catch (innerError) {
        console.error(`[ERROR] พังที่การ์ด: ${link}`, innerError);
        // ถึงจะพังก็ให้ลูปทำงานต่อ
      }
      
      // 👇 ให้บอทพักหายใจ 0.2 วินาที ก่อนดึงการ์ดใบต่อไป (เนียนเป็นมนุษย์)
      await delay(200); 
    }

    return NextResponse.json({
      message: `บันทึกซีรีส์ ${targetSeries} สำเร็จ ${scrapedData.length} ใบ`,
      data: scrapedData
    });

  } catch (error) {
    console.error("Bot Error:", error);
    return NextResponse.json({ error: 'Bot Error' }, { status: 500 });
  }
}