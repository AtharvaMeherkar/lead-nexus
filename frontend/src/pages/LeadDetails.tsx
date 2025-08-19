import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Skeleton,
  IconButton,
  Stack,
  Badge,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  ArrowBack,
  Business,
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  AttachMoney,
  Category,
  Description,
  CalendarToday,
  Verified,
  Star,
  ExpandMore,
  TrendingUp,
  Assessment,
  ContactSupport,
  Security,
  Speed,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api/client";
import CheckoutDialog from "./CheckoutDialog";

interface Lead {
  id: number;
  title: string;
  description: string;
  industry: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  price: number;
  status: string;
  created_at: string;
  vendor_id: number;
  vendor: {
    username: string;
    email: string;
  };
  extra?: {
    annual_revenue?: string;
    employee_count?: string;
    website?: string;
    linkedin?: string;
    company_description?: string;
    pain_points?: string;
    budget_range?: string;
    decision_maker?: string;
    timeline?: string;
    [key: string]: any;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lead-tabpanel-${index}`}
      aria-labelledby={`lead-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, role } = useSelector((state: RootState) => state.auth);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/leads/${id}`);
      setLead(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const onPurchase = async () => {
    if (!lead) return;
    try {
      const { data } = await api.post("/api/payments/create-intent", {
        lead_id: lead.id,
      });
      setClientSecret(data.client_secret);
      setCheckoutOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to initiate purchase.");
    }
  };

  const onCheckoutClose = () => {
    setCheckoutOpen(false);
    setClientSecret(null);
  };

  const onCheckoutSuccess = async () => {
    onCheckoutClose();
    setTimeout(fetchLead, 1200);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "success";
      case "sold":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case "technology":
      case "saas":
        return "💻";
      case "healthcare":
        return "🏥";
      case "finance":
        return "💰";
      case "education":
        return "🎓";
      case "retail":
        return "🛍️";
      case "manufacturing":
        return "🏭";
      case "real estate":
        return "🏠";
      case "legal":
        return "⚖️";
      case "marketing":
        return "📢";
      case "food & beverage":
        return "🍽️";
      case "construction":
        return "🏗️";
      case "consulting":
        return "📊";
      case "non-profit":
        return "🤝";
      case "e-commerce":
        return "🛒";
      default:
        return "🏢";
    }
  };

  const calculateLeadScore = (lead: Lead) => {
    let score = 50; // Base score

    // Company size bonus
    if (lead.extra?.employee_count) {
      const employees = parseInt(lead.extra.employee_count);
      if (employees > 1000) score += 20;
      else if (employees > 500) score += 15;
      else if (employees > 100) score += 10;
    }

    // Revenue bonus
    if (lead.extra?.annual_revenue) {
      const revenue = parseFloat(
        lead.extra.annual_revenue.replace(/[^0-9.]/g, "")
      );
      if (revenue > 10000000) score += 15;
      else if (revenue > 1000000) score += 10;
      else if (revenue > 100000) score += 5;
    }

    // Contact information bonus
    if (lead.contact_email && lead.contact_phone) score += 10;
    else if (lead.contact_email || lead.contact_phone) score += 5;

    // Location bonus
    if (lead.location) score += 5;

    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={40} width={200} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" height={60} />
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={100} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !lead) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Lead not found"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/marketplace")}
        >
          Back to Marketplace
        </Button>
      </Container>
    );
  }

  const leadScore = calculateLeadScore(lead);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/marketplace")}
          sx={{ mb: 2 }}
        >
          Back to Marketplace
        </Button>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4" fontWeight={700}>
            {lead.title}
          </Typography>
          <Chip
            label={lead.status.toUpperCase()}
            color={getStatusColor(lead.status) as any}
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" color="primary">
            {formatPrice(lead.price)}
          </Typography>
          <Chip
            icon={<Star />}
            label={`${leadScore}% Match Score`}
            color="warning"
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary">
            Listed {formatDate(lead.created_at)}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
              >
                <Tab label="Overview" />
                <Tab label="Company Details" />
                <Tab label="Contact Information" />
                <Tab label="Lead Analysis" />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Lead Description
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {lead.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Key Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Category color="primary" />
                            <Typography variant="subtitle2">
                              Industry
                            </Typography>
                          </Box>
                          <Typography variant="h6">
                            {getIndustryIcon(lead.industry)} {lead.industry}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <LocationOn color="primary" />
                            <Typography variant="subtitle2">
                              Location
                            </Typography>
                          </Box>
                          <Typography variant="h6">{lead.location}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Lead Timeline
                  </Typography>
                  <Timeline>
                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        {formatDate(lead.created_at)}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6">Lead Created</Typography>
                        <Typography>Lead was added to marketplace</Typography>
                      </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        Now
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="success" />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6">
                          Available for Purchase
                        </Typography>
                        <Typography>Ready for immediate purchase</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </Box>
              </Stack>
            </TabPanel>

            {/* Company Details Tab */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Company Name
                      </Typography>
                      <Typography variant="h6">{lead.company_name}</Typography>
                    </Grid>
                    {lead.extra?.website && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Website
                        </Typography>
                        <Typography
                          variant="h6"
                          component="a"
                          href={lead.extra.website}
                          target="_blank"
                          sx={{ textDecoration: "none", color: "primary.main" }}
                        >
                          {lead.extra.website}
                        </Typography>
                      </Grid>
                    )}
                    {lead.extra?.employee_count && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Company Size
                        </Typography>
                        <Typography variant="h6">
                          {lead.extra.employee_count} employees
                        </Typography>
                      </Grid>
                    )}
                    {lead.extra?.annual_revenue && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Annual Revenue
                        </Typography>
                        <Typography variant="h6">
                          {lead.extra.annual_revenue}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {lead.extra?.company_description && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Company Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {lead.extra.company_description}
                    </Typography>
                  </Box>
                )}

                {lead.extra?.pain_points && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Pain Points & Challenges
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {lead.extra.pain_points}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </TabPanel>

            {/* Contact Information Tab */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Primary Contact
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Person color="primary" />
                            <Typography variant="subtitle2">
                              Contact Name
                            </Typography>
                          </Box>
                          <Typography variant="h6">
                            {lead.contact_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Work color="primary" />
                            <Typography variant="subtitle2">
                              Position
                            </Typography>
                          </Box>
                          <Typography variant="h6">
                            {lead.extra?.decision_maker || "Decision Maker"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Email color="primary" />
                            <Typography variant="subtitle2">Email</Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            component="a"
                            href={`mailto:${lead.contact_email}`}
                            sx={{
                              textDecoration: "none",
                              color: "primary.main",
                            }}
                          >
                            {lead.contact_email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Phone color="primary" />
                            <Typography variant="subtitle2">Phone</Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            component="a"
                            href={`tel:${lead.contact_phone}`}
                            sx={{
                              textDecoration: "none",
                              color: "primary.main",
                            }}
                          >
                            {lead.contact_phone}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>

                {lead.extra?.linkedin && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      LinkedIn Profile
                    </Typography>
                    <Button
                      variant="outlined"
                      component="a"
                      href={lead.extra.linkedin}
                      target="_blank"
                      startIcon={<Business />}
                    >
                      View LinkedIn Profile
                    </Button>
                  </Box>
                )}
              </Stack>
            </TabPanel>

            {/* Lead Analysis Tab */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Lead Quality Assessment
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography variant="h4" color="primary" gutterBottom>
                            {leadScore}%
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Match Score
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            color="success.main"
                            gutterBottom
                          >
                            {lead.contact_email && lead.contact_phone
                              ? "High"
                              : "Medium"}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Contact Quality
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography
                            variant="h4"
                            color="warning.main"
                            gutterBottom
                          >
                            {lead.extra?.budget_range || "Unknown"}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Budget Range
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Purchase Timeline
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {lead.extra?.timeline ||
                      "Timeline information not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Lead Insights
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Verified Contact Information"
                        secondary="Email and phone number provided"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Business color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Established Company"
                        secondary={`${
                          lead.extra?.employee_count || "Unknown"
                        } employees`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Growth Potential"
                        secondary="Based on company size and industry"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Stack>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Purchase Card */}
          <Card sx={{ mb: 3, position: "sticky", top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Purchase This Lead
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatPrice(lead.price)}
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Instant access to contact details
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Complete company information
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Lead quality guarantee
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={onPurchase}
                disabled={!token || lead.status.toLowerCase() !== "available"}
                sx={{ mb: 2 }}
              >
                {lead.status.toLowerCase() === "available"
                  ? "Purchase Lead"
                  : "Not Available"}
              </Button>

              {!token && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please log in to purchase this lead
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lead Provider
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {lead.vendor.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Provider
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Star color="warning" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Trusted Lead Provider
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Lead Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lead Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Listed Date"
                    secondary={formatDate(lead.created_at)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lead Score"
                    secondary={`${leadScore}% match`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Verification"
                    secondary="Contact verified"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        clientSecret={clientSecret}
        onClose={onCheckoutClose}
        onSuccess={onCheckoutSuccess}
        leadId={lead?.id}
        isCartCheckout={false}
      />
    </Container>
  );
}
