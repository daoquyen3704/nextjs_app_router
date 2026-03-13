'use client'
import React, { memo, ReactNode, useCallback, useState } from 'react';

interface ExpensiveButtonProps {
  onClick: () => void; // Hàm không trả về giá trị
  children: ReactNode; // Kiểu dữ liệu cho nội dung nằm giữa thẻ đóng/mở
}

// 2. Sử dụng interface trong Component
const ExpensiveButton = memo(({ onClick, children }: ExpensiveButtonProps) => {
  console.log(`===> Render nút: ${children}`);
  return (
    <button onClick={onClick} style={{ padding: '10px', marginTop: '10px' }}>
      {children}
    </button>
  );
});

export default function CallbackDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // CÚ PHÁP ĐÚNG:
  // Dùng prev => prev + 1 để không cần bỏ 'count' vào mảng dependency
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); 

  return (
    <div style={{ padding: '20px' }}>
      <h2>Thực hành useCallback()</h2>
      <p>Count: {count}</p>
      
      <ExpensiveButton onClick={increment}>Tăng số (Check Console)</ExpensiveButton>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Gõ để re-render cha..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p>Text: {text}</p>
      </div>
    </div>
  );
}