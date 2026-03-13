
'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api/auth';

async function fetchMe() {
  const res = await authFetch('/me/');  // authFetch tự gắn token + refresh nếu cần
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export default function Navbar() {
  const router = useRouter();

  // useQuery tự động biết user đăng nhập hay chưa
  const { data: user, isSuccess } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,       // không retry khi lỗi 401
    staleTime: 1000 * 60 * 5, // cache 5 phút
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <a className="navbar-brand fw-bold" href="/">MyBlog</a>
      <div className="ms-auto d-flex gap-2">
        {isSuccess ? (
          <>
            <span className="text-white-50 small align-self-center">Xin chào, {user.username}</span>
            <Link href="/profile" className="btn btn-outline-light btn-sm">Trang cá nhân</Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Đăng xuất</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline-light btn-sm">Đăng nhập</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}