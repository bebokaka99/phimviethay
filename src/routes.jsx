import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import WatchMovie from "./pages/WatchMovie";
import SearchPage from "./pages/SearchPage";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";

// --- BỔ SUNG 2 DÒNG IMPORT NÀY ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
// ---------------------------------

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFound />,
  },
  {
    path: "/phim/:slug",
    element: <MovieDetail />,
  },
  {
    path: "/xem-phim/:slug",
    element: <WatchMovie />,
  },
  {
    path: "/tim-kiem",
    element: <SearchPage />,
  },
  {
    path: "/the-loai/:slug",
    element: <Catalog group="the-loai" />,
  },
  {
    path: "/quoc-gia/:slug",
    element: <Catalog group="quoc-gia" />,
  },
  {
    path: "/danh-sach/:slug",
    element: <Catalog group="danh-sach" />,
  },
  {
    path: "/nam-phat-hanh/:slug",
    element: <Catalog group="nam-phat-hanh" />,
  },

  // Route xem tất cả
  { path: "/the-loai", element: <Catalog group="danh-sach" /> },
  { path: "/quoc-gia", element: <Catalog group="danh-sach" /> },
  { path: "/danh-sach", element: <Catalog group="danh-sach" /> },

  // --- AUTH ROUTES ---
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/ho-so",
    element: <Profile />,
  },
  {
    path: "/tu-phim",
    element: <Favorites />,
  },
  {
    path: "*",
    element: <NotFound />,
  }

]);