import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import WatchMovie from "./pages/WatchMovie";
import SearchPage from "./pages/SearchPage";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import History from "./pages/History";

// [MỚI] Import trang Watch Party
import WatchParty from "./pages/WatchParty";

import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Comments from "./pages/admin/Comments";
import Intros from "./pages/admin/Intros";

export const router = createBrowserRouter([
  {
    element: <MainLayout />, 
    children: [
      { path: "/", element: <Home /> },
      { path: "/phim/:slug", element: <MovieDetail /> },
      { path: "/xem-phim/:slug", element: <WatchMovie /> },
      
      // [MỚI] Route Xem chung (Watch Party)
      // :roomId? nghĩa là tham số này có thể có hoặc không
      { path: "/watch-party/:roomId?", element: <WatchParty /> },

      { path: "/tim-kiem", element: <SearchPage /> },
      { path: "/the-loai/:slug", element: <Catalog group="the-loai" /> },
      { path: "/quoc-gia/:slug", element: <Catalog group="quoc-gia" /> },
      { path: "/danh-sach/:slug", element: <Catalog group="danh-sach" /> },
      { path: "/nam-phat-hanh/:slug", element: <Catalog group="nam-phat-hanh" /> },

      // Các trang không có slug
      { path: "/the-loai", element: <Catalog group="danh-sach" /> },
      { path: "/quoc-gia", element: <Catalog group="danh-sach" /> },
      { path: "/danh-sach", element: <Catalog group="danh-sach" /> },

      // Auth & User
      { path: "/ho-so", element: <Profile /> },
      { path: "/tu-phim", element: <Favorites /> },
      {
        path: "/lich-su",
        element: <History />,
      },
    ],
    errorElement: <NotFound />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "users", element: <Users /> },   
      { path: "comments", element: <Comments /> }, 
      { path: "intros", element: <Intros /> },
    ]
  },

  // Login/Register thường đứng riêng, không cần Header/Footer
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);