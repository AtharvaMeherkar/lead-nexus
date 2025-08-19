import React, { useState, useEffect } from "react";
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Error,
  Info,
  Warning,
  Close,
  DoneAll,
  Delete,
  Refresh,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api/client";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  data?: any;
  created_at: string;
}

interface NotificationSummary {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  type_breakdown: Record<string, number>;
}

export default function NotificationCenter() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [markingRead, setMarkingRead] = useState<number | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchSummary();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/workflows/notifications?limit=20");
      setNotifications(response.data.notifications);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get("/api/workflows/notifications/summary");
      setSummary(response.data);
    } catch (err: any) {
      console.error("Failed to load notification summary:", err);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      setMarkingRead(notificationId);
      await api.post(`/api/workflows/notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Refresh summary
      fetchSummary();
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to mark notification as read"
      );
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/api/workflows/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      fetchSummary();
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to mark all notifications as read"
      );
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await api.delete(`/api/workflows/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      fetchSummary();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle color="success" />;
      case "error":
        return <Error color="error" />;
      case "warning":
        return <Warning color="warning" />;
      case "info":
      default:
        return <Info color="info" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "success.main";
      case "error":
        return "error.main";
      case "warning":
        return "warning.main";
      case "info":
      default:
        return "info.main";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!token) return null;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ position: "relative" }}
        >
          {summary?.unread_notifications ? (
            <Badge badgeContent={summary.unread_notifications} color="error">
              <NotificationsActive />
            </Badge>
          ) : (
            <Notifications />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={fetchNotifications}
                  disabled={loading}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              {summary?.unread_notifications ? (
                <Tooltip title="Mark all as read">
                  <IconButton size="small" onClick={handleMarkAllRead}>
                    <DoneAll />
                  </IconButton>
                </Tooltip>
              ) : null}
              <IconButton size="small" onClick={handleClose}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {summary && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`${summary.total_notifications} total`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${summary.unread_notifications} unread`}
                  size="small"
                  color="primary"
                />
                {Object.entries(summary.type_breakdown).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${count} ${type}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: getNotificationColor(type),
                      borderColor: getNotificationColor(type),
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box textAlign="center" p={3}>
              <Notifications
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    borderLeft: `3px solid ${getNotificationColor(
                      notification.type
                    )}`,
                    backgroundColor: notification.read
                      ? "transparent"
                      : "action.hover",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                  secondaryAction={
                    <Box display="flex" gap={0.5}>
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkRead(notification.id)}
                            disabled={markingRead === notification.id}
                          >
                            {markingRead === notification.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircle fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        fontWeight={notification.read ? 400 : 600}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          {notifications.length > 0 && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = "/notifications";
                }}
              >
                View All Notifications
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
