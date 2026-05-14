import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_SECRET_PASSWORD;
    console.log("Password in Env:", adminPassword);

    if (password === adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set('admin_auth', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, 
        path: '/',
      });

      return NextResponse.json({ message: 'เข้าสู่ระบบสำเร็จ' });
    }

    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}