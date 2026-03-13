'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api/auth';

type UploadItem = {
  id: number;
  key: string;
  content_type: string;
  size: number;
  created_at: string;
};

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function UploadListPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const fetchFiles = async (p = page) => {
    try {
      setLoading(true);
      setErr('');

      // DRF pagination: ?page= &page_size=
      const res = await authFetch(`/api/storage/uploads/?page=${p}&page_size=${pageSize}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data = (await res.json()) as DRFPaginated<UploadItem> | UploadItem[];

      // Nếu backend chưa paginate thì nó trả list thẳng => handle luôn
      if (Array.isArray(data)) {
        setItems(data);
        setCount(data.length);
      } else {
        setItems(data.results ?? []);
        setCount(data.count ?? 0);
      }
    } catch (e: any) {
      setErr(e?.message || 'Có lỗi khi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm(`Xóa file id=${id} ?`)) return;

    try {
      setDeletingId(id);
      setErr('');

      // Endpoint delete: /api/uploads/<id>/
      const res = await authFetch(`/api/storage/uploads/${id}/`, {
        method: 'DELETE',
      });

      if (res.status !== 204 && !res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }

      // Refresh list
      // Nếu xóa xong mà page rỗng (xóa item cuối trang), lùi trang
      const newCount = count - 1;
      const newTotalPages = Math.max(1, Math.ceil(newCount / pageSize));
      const nextPage = Math.min(page, newTotalPages);

      setCount(newCount);
      setPage(nextPage);
      // fetch lại theo nextPage (nếu page bị đổi ở trên thì effect sẽ tự gọi)
      if (nextPage === page) fetchFiles(nextPage);
    } catch (e: any) {
      setErr(e?.message || 'Có lỗi khi xóa');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Danh sách file đã upload</h1>

        <button
          onClick={() => fetchFiles(page)}
          className="px-3 py-2 rounded bg-black text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Reload'}
        </button>
      </div>

      {err && (
        <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
          {err}
        </div>
      )}

      <div className="rounded border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-sm font-semibold">
          <div className="col-span-1">ID</div>
          <div className="col-span-5">Key</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {loading && items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Đang tải dữ liệu...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Chưa có file nào.</div>
        ) : (
          items.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-12 gap-2 px-3 py-3 border-t text-sm items-center"
            >
              <div className="col-span-1">{f.id}</div>

              <div className="col-span-5">
                <div className="font-medium break-all">{f.key}</div>
                <div className="text-xs text-gray-500">
                  {new Date(f.created_at).toLocaleString()}
                </div>
              </div>

              <div className="col-span-3 break-all">{f.content_type}</div>
              <div className="col-span-2">{formatBytes(f.size)}</div>

              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={deletingId === f.id}
                  className="px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-60"
                >
                  {deletingId === f.id ? '...' : 'Xóa'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Tổng: {count} • Trang {page}/{totalPages}
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded border disabled:opacity-60"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="px-3 py-2 rounded border disabled:opacity-60"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}