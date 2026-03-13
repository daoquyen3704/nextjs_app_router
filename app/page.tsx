import Link from "next/link";

export default function Home() {
  const posts = [
    { id: 1, title: "Bắt đầu với Next.js", excerpt: "Hướng dẫn cơ bản về Next.js App Router và cách tổ chức project.", date: "20/02/2026", author: "Admin" },
    { id: 2, title: "React Query là gì?", excerpt: "Tìm hiểu về TanStack Query và cách quản lý server state trong React.", date: "21/02/2026", author: "Admin" },
    { id: 3, title: "Django REST Framework", excerpt: "Xây dựng API mạnh mẽ với Django và DRF, tích hợp JWT authentication.", date: "22/02/2026", author: "Admin" },
  ];

  return (
    <>
      {/* Hero */}
      <div className="bg-dark text-white text-center py-5">
        <div className="container py-4">
          <h1 className="display-5 fw-bold mb-3">Chào mừng đến MyBlog</h1>
          <p className="lead text-secondary mb-4">
            Nơi chia sẻ kiến thức về lập trình, công nghệ và nhiều hơn nữa.
          </p>
          <Link href="/register" className="btn btn-primary px-4 py-2">
            Bắt đầu viết blog →
          </Link>
        </div>
      </div>

      {/* Posts */}
      <div className="container py-5">
        <h2 className="mb-4 fw-semibold">Bài viết mới nhất</h2>
        <div className="row g-4">
          {posts.map((post) => (
            <div className="col-md-4" key={post.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-semibold">{post.title}</h5>
                  <p className="card-text text-muted small">{post.excerpt}</p>
                </div>
                <div className="card-footer d-flex justify-content-between text-muted small">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-secondary text-center py-3 mt-auto">
        <small>© 2026 MyBlog — Được xây dựng với Next.js & Django</small>
      </footer>
    </>
  );
}
