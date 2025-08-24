import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ResponsiveNavigation from "./components/ResponsiveNavigation";
import AnimatedPageTransition from "./components/AnimatedPageTransition";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import Orders from "./pages/Orders";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import TeamPage from "./pages/TeamPage";
import Landing from "./pages/Landing";
import VendorUpload from "./pages/VendorUpload";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDashboard from "./pages/ClientDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import Cart from "./pages/Cart";
import TermsPage from "./pages/TermsPage";
import LeadDetails from "./pages/LeadDetails";
import ContactSales from "./pages/ContactSales";
import Profile from "./pages/Profile";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { logout } from "./features/auth/authSlice";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role } = useSelector((state: RootState) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <ThemeProvider>
      <Box>
        <ResponsiveNavigation />
        <Container sx={{ mt: 3 }}>
          <AnimatedPageTransition>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute roles={["client", "vendor", "admin"]}>
                    <Marketplace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace/:id"
                element={
                  <ProtectedRoute roles={["client", "vendor", "admin"]}>
                    <LeadDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/contact-sales" element={<ContactSales />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute roles={["client", "admin"]}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute roles={["vendor", "admin"]}>
                    <VendorUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/client"
                element={
                  <ProtectedRoute roles={["client", "admin"]}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute roles={["client", "admin"]}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/vendor"
                element={
                  <ProtectedRoute roles={["vendor", "admin"]}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/terms" element={<TermsPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={["client", "vendor", "admin"]}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatedPageTransition>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
