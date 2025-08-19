import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  Visibility,
  Receipt,
  Download,
  Email,
  Phone,
  Business,
  Person,
  LocationOn,
  Category,
  CalendarToday,
  Payment,
  CheckCircle,
  Pending,
  Error,
  ExpandMore,
  Timeline as TimelineIcon,
  Assessment,
  ContactSupport,
  Security,
  Speed,
  Warning,
  Info,
  ArrowBack,
  Refresh,
  FilterList,
} from "@mui/icons-material";

interface OrderItem {
  purchase_id: number;
  lead_id: number;
  title: string;
  industry: string;
  price: number;
  status: string;
  created_at: string;
  lead?: {
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    company_name: string;
    location: string;
    description: string;
    extra?: {
      website?: string;
      linkedin?: string;
      annual_revenue?: string;
      employee_count?: string;
      [key: string]: any;
    };
  };
}

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: OrderItem | null;
}

function OrderDetailsDialog({ open, onClose, order }: OrderDetailsDialogProps) {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStatusTimeline = (status: string, createdAt: string) => {
    const timeline = [
      {
        date: createdAt,
        title: "Order Placed",
        description: "Your order was successfully placed",
        icon: <Payment color="primary" />,
        color: "primary" as const,
      },
    ];

    if (status === "paid" || status === "requires_payment") {
      timeline.push({
        date: new Date(createdAt).toISOString(),
        title: "Payment Processed",
        description: "Payment has been processed successfully",
        icon: <CheckCircle color="success" />,
        color: "success" as const,
      });
    }

    if (status === "paid") {
      timeline.push({
        date: new Date(createdAt).toISOString(),
        title: "Lead Delivered",
        description: "Lead information has been delivered to your account",
        icon: <CheckCircle color="success" />,
        color: "success" as const,
      });
    }

    return timeline;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt color="primary" />
          <Typography variant="h6">
            Order #{order.purchase_id} - {order.title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Order Summary */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order ID
                  </Typography>
                  <Typography variant="h6">#{order.purchase_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatPrice(order.price)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(order.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={order.status === "paid" ? "success" : "warning"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lead Information */}
          {order.lead && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lead Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Business color="primary" />
                      <Typography variant="subtitle2">Company</Typography>
                    </Box>
                    <Typography variant="h6">
                      {order.lead.company_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Category color="primary" />
                      <Typography variant="subtitle2">Industry</Typography>
                    </Box>
                    <Typography variant="h6">{order.industry}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Person color="primary" />
                      <Typography variant="subtitle2">Contact</Typography>
                    </Box>
                    <Typography variant="h6">
                      {order.lead.contact_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOn color="primary" />
                      <Typography variant="subtitle2">Location</Typography>
                    </Box>
                    <Typography variant="h6">{order.lead.location}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Contact Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Email color="primary" />
                      <Typography variant="subtitle2">Email</Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      component="a"
                      href={`mailto:${order.lead.contact_email}`}
                      sx={{ textDecoration: "none", color: "primary.main" }}
                    >
                      {order.lead.contact_email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Phone color="primary" />
                      <Typography variant="subtitle2">Phone</Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      component="a"
                      href={`tel:${order.lead.contact_phone}`}
                      sx={{ textDecoration: "none", color: "primary.main" }}
                    >
                      {order.lead.contact_phone}
                    </Typography>
                  </Grid>
                </Grid>

                {order.lead.extra?.website && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Additional Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Website
                        </Typography>
                        <Typography
                          variant="h6"
                          component="a"
                          href={order.lead.extra.website}
                          target="_blank"
                          sx={{ textDecoration: "none", color: "primary.main" }}
                        >
                          {order.lead.extra.website}
                        </Typography>
                      </Grid>
                      {order.lead.extra.linkedin && (
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            LinkedIn
                          </Typography>
                          <Typography
                            variant="h6"
                            component="a"
                            href={order.lead.extra.linkedin}
                            target="_blank"
                            sx={{
                              textDecoration: "none",
                              color: "primary.main",
                            }}
                          >
                            View Profile
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Timeline
              </Typography>
              <Timeline>
                {getStatusTimeline(order.status, order.created_at).map(
                  (item, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent color="text.secondary">
                        {formatDate(item.date)}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={item.color}>
                          {item.icon}
                        </TimelineDot>
                        {index <
                          getStatusTimeline(order.status, order.created_at)
                            .length -
                            1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography color="text.secondary">
                          {item.description}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  )
                )}
              </Timeline>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => {
            // Generate and download receipt
            const receipt = `
              Lead-Nexus Receipt
              Order #${order.purchase_id}
              Date: ${formatDate(order.created_at)}
              Amount: ${formatPrice(order.price)}
              Lead: ${order.title}
              Status: ${order.status}
            `;
            const blob = new Blob([receipt], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `receipt-${order.purchase_id}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Orders() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/orders/my");
      setItems(data.items);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(
        err.response?.data?.error || "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "requires_payment":
        return "warning";
      case "refunded":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle color="success" />;
      case "requires_payment":
        return <Pending color="warning" />;
      case "refunded":
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const filteredItems = items.filter(
    (item) =>
      filterStatus === "all" ||
      item.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const totalSpent = items.reduce((sum, item) => sum + item.price, 0);
  const paidOrders = items.filter((item) => item.status === "paid").length;

  const handleViewDetails = (order: OrderItem) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          My Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOrders}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Receipt color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {items.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {paidOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Payment color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    ${totalSpent.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FilterList color="action" />
        <Typography variant="subtitle1">Filter by status:</Typography>
        <Chip
          label="All"
          onClick={() => setFilterStatus("all")}
          color={filterStatus === "all" ? "primary" : "default"}
          variant={filterStatus === "all" ? "filled" : "outlined"}
        />
        <Chip
          label="Paid"
          onClick={() => setFilterStatus("paid")}
          color={filterStatus === "paid" ? "success" : "default"}
          variant={filterStatus === "paid" ? "filled" : "outlined"}
        />
        <Chip
          label="Pending"
          onClick={() => setFilterStatus("requires_payment")}
          color={filterStatus === "requires_payment" ? "warning" : "default"}
          variant={filterStatus === "requires_payment" ? "filled" : "outlined"}
        />
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Receipt sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {filterStatus === "all"
                ? "No orders yet"
                : `No ${filterStatus} orders`}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {filterStatus === "all"
                ? "Start exploring leads in the marketplace to make your first purchase."
                : `You don't have any ${filterStatus} orders at the moment.`}
            </Typography>
            {filterStatus === "all" && (
              <Button
                variant="contained"
                onClick={() => navigate("/marketplace")}
                startIcon={<ArrowBack />}
              >
                Browse Marketplace
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      {!loading && !error && filteredItems.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((order) => (
                <TableRow key={order.purchase_id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      #{order.purchase_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {order.title}
                      </Typography>
                      {order.lead?.company_name && (
                        <Typography variant="body2" color="text.secondary">
                          {order.lead.company_name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.industry}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary"
                    >
                      ${order.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(order.status)}
                      <Chip
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Order Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Receipt />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Lead Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/marketplace/${order.lead_id}`)
                          }
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </Box>
  );
}
