import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  Security,
  Notifications,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
  Lock,
  Key,
  Shield,
  NotificationsActive,
  NotificationsOff,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../features/auth/authSlice";
import api from "../api/client";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    avatar_url?: string;
  };
  preferences?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    marketing_emails: boolean;
    two_factor_auth: boolean;
  };
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function Profile() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile editing states
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    company: "",
    position: "",
    location: "",
    bio: "",
  });

  // Password change states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Preferences states
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    two_factor_auth: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/profile");
      setProfile(response.data);
      setProfileData({
        first_name: response.data.profile?.first_name || "",
        last_name: response.data.profile?.last_name || "",
        phone: response.data.profile?.phone || "",
        company: response.data.profile?.company || "",
        position: response.data.profile?.position || "",
        location: response.data.profile?.location || "",
        bio: response.data.profile?.bio || "",
      });
      setPreferences(
        response.data.preferences || {
          email_notifications: true,
          sms_notifications: false,
          marketing_emails: false,
          two_factor_auth: false,
        }
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put("/api/profile", {
        profile: profileData,
      });
      setSuccess("Profile updated successfully!");
      setEditingProfile(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.put("/api/profile/password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess("Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesChange = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put("/api/profile/preferences", {
        preferences,
      });
      setSuccess("Preferences updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await api.delete("/api/profile");
        dispatch(logout());
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to delete account");
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          Profile Settings
        </Typography>
        <Chip
          label={profile?.role?.toUpperCase() || "USER"}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">Profile Information</Typography>
              <Button
                variant={editingProfile ? "outlined" : "contained"}
                startIcon={editingProfile ? <Cancel /> : <Edit />}
                onClick={() => {
                  if (editingProfile) {
                    setEditingProfile(false);
                    setProfileData({
                      first_name: profile?.profile?.first_name || "",
                      last_name: profile?.profile?.last_name || "",
                      phone: profile?.profile?.phone || "",
                      company: profile?.profile?.company || "",
                      position: profile?.profile?.position || "",
                      location: profile?.profile?.location || "",
                      bio: profile?.profile?.bio || "",
                    });
                  } else {
                    setEditingProfile(true);
                  }
                }}
              >
                {editingProfile ? "Cancel" : "Edit Profile"}
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.first_name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      first_name: e.target.value,
                    })
                  }
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.last_name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      last_name: e.target.value,
                    })
                  }
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profile?.email || ""}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={profileData.company}
                  onChange={(e) =>
                    setProfileData({ ...profileData, company: e.target.value })
                  }
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={profileData.position}
                  onChange={(e) =>
                    setProfileData({ ...profileData, position: e.target.value })
                  }
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  disabled={!editingProfile}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            {editingProfile && (
              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleProfileSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditingProfile(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Paper>

          {/* Security Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle1">Password</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Change your account password
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </Box>
              <Divider />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle1">
                    Two-Factor Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add an extra layer of security to your account
                  </Typography>
                </Box>
                <Switch
                  checked={preferences.two_factor_auth}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      two_factor_auth: e.target.checked,
                    })
                  }
                />
              </Box>
            </Stack>
          </Paper>

          {/* Notification Preferences */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.email_notifications}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        email_notifications: e.target.checked,
                      })
                    }
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.sms_notifications}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        sms_notifications: e.target.checked,
                      })
                    }
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.marketing_emails}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        marketing_emails: e.target.checked,
                      })
                    }
                  />
                }
                label="Marketing Emails"
              />
              <Button
                variant="contained"
                onClick={handlePreferencesChange}
                disabled={saving}
                sx={{ alignSelf: "flex-start" }}
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Profile Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profileData.first_name && profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : profile?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.role?.toUpperCase()}
              </Typography>
              <Chip
                label={profile?.is_active ? "Active" : "Inactive"}
                color={profile?.is_active ? "success" : "error"}
                size="small"
              />
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={profile?.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(
                      profile?.created_at || ""
                    ).toLocaleDateString()}
                  />
                </ListItem>
                {profileData.company && (
                  <ListItem>
                    <ListItemIcon>
                      <Business fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company"
                      secondary={profileData.company}
                    />
                  </ListItem>
                )}
                {profileData.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={profileData.location}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card sx={{ border: "1px solid #f44336" }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These actions cannot be undone.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleAccountDeletion}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.current_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  current_password: e.target.value,
                })
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  new_password: e.target.value,
                })
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirm_password}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirm_password: e.target.value,
                })
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={
              saving ||
              !passwordData.current_password ||
              !passwordData.new_password ||
              !passwordData.confirm_password
            }
          >
            {saving ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
