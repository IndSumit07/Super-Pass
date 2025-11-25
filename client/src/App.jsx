import React from "react";
import { Route, Routes } from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateEvent from "./pages/CreateEvent";
import RegisterEvent from "./pages/RegisterEvent";
import MyPasses from "./pages/MyPasses";
import PassDetails from "./pages/PassDetails";
import ScanPage from "./pages/Scan";
import ScanPass from "./pages/Scan";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import ManageEvent from "./pages/ManageEvent";
import Pricing from "./pages/Pricing";
import Withdrawals from "./pages/Withdrawals";
import AdminWithdrawals from "./pages/AdminWithdrawals";

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Start />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/register"
          element={
            <ProtectedRoute>
              <RegisterEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-passes"
          element={
            <ProtectedRoute>
              <MyPasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-passes/:id"
          element={
            <ProtectedRoute>
              <PassDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/scan"
          element={
            <ProtectedRoute>
              <ScanPass />
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          path="/withdrawals"
          element={
            <ProtectedRoute>
              <Withdrawals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <ProtectedRoute>
              <AdminWithdrawals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/manage"
          element={
            <ProtectedRoute>
              <ManageEvent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
