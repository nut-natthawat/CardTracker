'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchFilter({ boxes }: { boxes: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ฟังก์ชันอัปเดต URL เมื่อพิมพ์ค้นหา
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    router.replace(`/?${params.toString()}`);
  };

  // ฟังก์ชันอัปเดต URL เมื่อเลือก Box
  const handleBoxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('box', e.target.value);
    } else {
      params.delete('box');
    }
    router.replace(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* ช่องค้นหาชื่อ */}
      <input
        type="text"
        placeholder="ค้นหาชื่อการ์ด..."
        defaultValue={searchParams.get('q') || ''}
        onChange={handleSearch}
        className="flex-1 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Dropdown เลือกกล่อง/ซีรีส์ */}
      <select
        defaultValue={searchParams.get('box') || ''}
        onChange={handleBoxChange}
        className="p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">ทุกกล่อง / ทุกซีรีส์</option>
        {boxes.map((box) => (
          <option key={box} value={box}>
            {box}
          </option>
        ))}
      </select>
    </div>
  );
}