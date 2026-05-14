import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const baseUrl = 'https://onepiece.limitlesstcg.com';
    const res = await fetch(`${baseUrl}/cards`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const seriesList: { code: string; name: string; url: string }[] = [];

    $('table').first().find('tbody tr').each((_, el) => {
      const code = $(el).find('td:nth-child(1)').text().trim();
      const name = $(el).find('td:nth-child(2) a').text().trim();
      const href = $(el).find('td:nth-child(2) a').attr('href');

      const isBoosterPack = code.startsWith('OP') || code.startsWith('EB') || code.startsWith('PRB');

      if (code && name && href && isBoosterPack) {
        seriesList.push({ 
          code, 
          name, 
          url: href.replace('/cards/', '') 
        });
      }
    });

    return NextResponse.json(seriesList);
  } catch (error) {
    return NextResponse.json({ error: 'ดึงรายชื่อชุดไม่สำเร็จ' }, { status: 500 });
  }
}