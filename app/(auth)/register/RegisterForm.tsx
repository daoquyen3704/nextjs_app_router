// app/(auth)/register/RegisterForm.tsx
'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { registerApi } from '@/lib/api/auth';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  // ✅ useMutation cho đăng ký
  const registerMutation = useMutation({
    mutationFn: () => registerApi({ username, email, password }),

    onSuccess: () => {
      // Đăng ký xong → chuyển sang trang login
      router.push('/login');
    },

    onError: (error: Error) => {
      console.error('Register failed:', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phía client trước khi gọi API
    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow col-12 col-md-4">
        <h3 className="text-center mb-4">Register</h3>

        {/* Hiển thị lỗi từ server */}
        {registerMutation.isError && (
          <div className="alert alert-danger">
            {registerMutation.error.message}
          </div>
        )}

        {/* Hiển thị thành công */}
        {registerMutation.isSuccess && (
          <div className="alert alert-success">
            Đăng ký thành công! Đang chuyển tới trang đăng nhập...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control" />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Đang đăng ký...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}