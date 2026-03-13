// app/(auth)/login/LoginForm.tsx
'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api/auth';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  // ✅ useMutation cho đăng nhập
  const loginMutation = useMutation({
    mutationFn: () => loginApi({ username, password }),

    onSuccess: (data) => {
      // Lưu token vào localStorage (hoặc cookie)
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      queryClient.invalidateQueries({ queryKey: ['me'] });
  
      router.push('/');
    },

    onError: (error: Error) => {
      // error.message đã được set trong loginApi
      console.error('Login failed:', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(); // Gọi mutation
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow col-12 col-md-4">
        <h3 className="text-center mb-4">Login</h3>

        {/* Hiển thị lỗi từ server */}
        {loginMutation.isError && (
          <div className="alert alert-danger">
            {loginMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              type="text"
              value={username}
              placeholder="Nhập username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              placeholder="Nhập password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* loginMutation.isPending = đang gọi API */}
          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Đang đăng nhập...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}