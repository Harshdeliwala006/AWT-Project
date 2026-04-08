import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Boards from "../pages/Boards";
import Create from "../pages/Create";
import BoardDetails from "../pages/BoardDetails";
import Notifications from "../pages/Notifications";
import Posts from "../pages/Posts";
import Settings from "../pages/Settings";
import PostDetails from "../pages/PostDetails";
import Profile from "../pages/Profile";
import CreatePost from "../pages/CreatePost";
import CreateImage from "../pages/CreateImage";
import CreateReel from "../pages/CreateReel";
import CreateBoard from "../pages/CreateBoard";
import Chat from "../pages/Chat";
import Search from "../pages/Searchs";
import Reels from "../pages/Reels";
import AdminLayout from "../admin/components/AdminLayout";
import AdminDashboard from "../admin/pages/Dashboard";
import AdminUsers from "../admin/pages/Users";
import AdminPosts from "../admin/pages/Posts";
import AdminReels from "../admin/pages/Reels";
import AdminReports from "../admin/pages/Reports";
import AdminNotifications from "../admin/pages/Notifications";
import AdminAnalytics from "../admin/pages/Analytics";
import AdminSettings from "../admin/pages/Settings"
import Navbar from "../components/Navbar";
import ProtectedRoute from "./ProtectedRoute";

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boards"
          element={
            <ProtectedRoute>
              <Boards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boards/:id"
          element={
            <ProtectedRoute>
              <BoardDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <Posts />
            </ProtectedRoute>
          }
        />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:id" element={<Profile />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reels"
          element={
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/image"
          element={
            <ProtectedRoute>
              <CreateImage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/reel"
          element={
            <ProtectedRoute>
              <CreateReel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/board"
          element={
            <ProtectedRoute>
              <CreateBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="reels" element={<AdminReels />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default AppRoutes;