# 🎥 PhimVietHay - Nền tảng Xem Phim Trực Tuyến Hiện Đại

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=nodedotjs)
![Database](https://img.shields.io/badge/Database-TiDB_%2F_MySQL-4479A1?logo=mysql)
![Style](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?logo=tailwindcss)

**PhimVietHay** là một ứng dụng web xem phim trực tuyến trọn gói (Full-stack) được xây dựng với MERN Stack (sử dụng TiDB làm cơ sở dữ liệu). Dự án tập trung vào trải nghiệm người dùng mượt mà, giao diện Dark Mode hiện đại và tốc độ tải trang nhanh.

## 🌟 Tính Năng Nổi Bật

### 👤 Xác Thực & Người Dùng
- **Đăng nhập/Đăng ký:** Bảo mật với JWT (JSON Web Token).
- **Google OAuth:** Đăng nhập nhanh bằng tài khoản Google.
- **Auto Merge Account:** Tự động đồng bộ tài khoản nếu email trùng khớp.
- **Profile:** Quản lý thông tin cá nhân, cập nhật Avatar.

### 🎬 Trải Nghiệm Xem Phim
- **Kho Phim Đa Dạng:** Phim Lẻ, Phim Bộ, TV Shows, Hoạt Hình.
- **Tìm Kiếm Thông Minh:** Tìm kiếm theo từ khóa với Debounce (giảm tải server).
- **Bộ Lọc:** Lọc theo Quốc gia, Thể loại, Năm phát hành.
- **Player:** Trình phát video mượt mà, hỗ trợ server dự phòng.

### ❤️ Cá Nhân Hóa
- **Yêu Thích:** Lưu phim vào danh sách xem sau.
- **Lịch Sử:** Tự động lưu tiến độ và lịch sử các phim đã xem.
- **Bình Luận:** Thảo luận, đánh giá phim (Real-time).

### 🛠️ Tính Năng Khác
- **Responsive:** Tương thích hoàn hảo trên Mobile, Tablet và Desktop.
- **Rạp Phim Online (Watch Party):** Xem phim cùng bạn bè (Đang phát triển).
- **Admin Dashboard:** Quản lý phim, người dùng, thống kê (Dành cho quản trị viên).

## 🚀 Công Nghệ Sử Dụng

| Phần | Công Nghệ | Chi Tiết |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Framework chính, tốc độ build siêu nhanh. |
| | Tailwind CSS | Styling, Responsive, Animations. |
| | React Router Dom | Điều hướng trang (SPA). |
| | Axios | Xử lý HTTP Request & Interceptors. |
| **Backend** | Node.js / Express | Server xử lý logic API. |
| | Passport.js | Xử lý xác thực Google OAuth. |
| | JWT | Xác thực phiên đăng nhập an toàn. |
| **Database** | TiDB Cloud | Cơ sở dữ liệu SQL phân tán (MySQL Compatible). |
| **Deploy** | Render / Vercel | Hosting cho Server và Client. |

## 📸 Ảnh Demo (Screenshots)

> *Bạn hãy thay thế các đường link bên dưới bằng ảnh chụp màn hình thực tế của dự án nhé!*

| Trang Chủ | Trang Chi Tiết |
| :---: | :---: |
| ![Home](https://via.placeholder.com/600x300?text=Home+Page+Preview) | ![Detail](https://via.placeholder.com/600x300?text=Movie+Detail+Preview) |

| Trang Đăng Nhập | Giao Diện Mobile |
| :---: | :---: |
| ![Login](https://via.placeholder.com/600x300?text=Login+Page+Preview) | ![Mobile](https://via.placeholder.com/600x300?text=Mobile+Responsive) |

## 🔧 Hướng Dẫn Cài Đặt (Localhost)

Để chạy dự án trên máy cá nhân, hãy làm theo các bước sau:

### 1. Clone dự án
```bash
git clone [https://github.com/username-cua-ban/phimviethay.git](https://github.com/username-cua-ban/phimviethay.git)
cd phimviethay
