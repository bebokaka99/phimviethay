import { useState, useEffect, useRef } from 'react';

export default function useOnScreen(options) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Khi thành phần xuất hiện trong màn hình
      if (entry.isIntersecting) {
        setVisible(true);
        // Ngắt theo dõi ngay sau khi đã hiện (chỉ load 1 lần)
        if (ref.current) observer.unobserve(ref.current);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, options]);

  return [ref, visible];
}