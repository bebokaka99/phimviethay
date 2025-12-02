import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTopBtn = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Hiện nút khi cuộn quá 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-8 right-8 z-[90]">
      <button
        type="button"
        onClick={scrollToTop}
        className={`
            p-3 rounded-full bg-red-600 text-white shadow-lg shadow-red-900/40 
            transition-all duration-300 transform hover:scale-110 hover:bg-red-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <FaArrowUp className="text-lg" />
      </button>
    </div>
  );
};

export default ScrollToTopBtn;