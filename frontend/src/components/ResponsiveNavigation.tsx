import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  ShoppingCart,
  Receipt,
  Upload,
  AccountBalance,
  Person,
  Store,
  Notifications,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../features/auth/authSlice";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "./ThemeToggle";

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  requiresAuth?: boolean;
}

const ResponsiveNavigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMobileOpen(false);
  };

  const navigationItems: NavigationItem[] = [
    // Public items (visible when not logged in)
    {
      label: "Features",
      path: "/features",
      icon: <Store />,
      requiresAuth: false,
    },
    {
      label: "Pricing",
      path: "/pricing",
      icon: <AccountBalance />,
      requiresAuth: false,
    },
    {
      label: "Team",
      path: "/team",
      icon: <Person />,
      requiresAuth: false,
    },
    // Client items
    {
      label: "Marketplace",
      path: "/marketplace",
      icon: <Store />,
      roles: ["client", "vendor", "admin"],
      requiresAuth: true,
    },
    {
      label: "Cart",
      path: "/cart",
      icon: <ShoppingCart />,
      roles: ["client", "admin"],
      requiresAuth: true,
    },
    {
      label: "Orders",
      path: "/orders",
      icon: <Receipt />,
      roles: ["client", "admin"],
      requiresAuth: true,
    },
    {
      label: "Dashboard",
      path: "/dashboard/client",
      icon: <Dashboard />,
      roles: ["client", "admin"],
      requiresAuth: true,
    },
    // Vendor items
    {
      label: "Dashboard",
      path: "/dashboard/vendor",
      icon: <Dashboard />,
      roles: ["vendor", "admin"],
      requiresAuth: true,
    },
    {
      label: "Upload",
      path: "/upload",
      icon: <Upload />,
      roles: ["vendor", "admin"],
      requiresAuth: true,
    },

    // Profile
    {
      label: "Profile",
      path: "/profile",
      icon: <Person />,
      requiresAuth: true,
    },
  ];

  const getVisibleItems = () => {
    return navigationItems.filter((item) => {
      if (item.requiresAuth && !token) return false;
      if (!item.requiresAuth && token) return false;
      if (item.roles && !item.roles.includes(role)) return false;
      return true;
    });
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {getVisibleItems().map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {token && (
          <ListItem
            onClick={onLogout}
            sx={{
              color: "inherit",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            component={Link}
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Lead-Nexus
          </Typography>

          {isMobile ? (
            <>
              <ThemeToggle />
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              {/* Desktop Navigation */}
              {getVisibleItems().map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ ml: 1 }}
                >
                  {item.label}
                </Button>
              ))}

              {token && <NotificationCenter />}
              <ThemeToggle />

              {!token ? (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={Link} to="/register">
                    Register
                  </Button>
                </>
              ) : (
                <Button color="inherit" onClick={onLogout}>
                  Logout
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default ResponsiveNavigation;
