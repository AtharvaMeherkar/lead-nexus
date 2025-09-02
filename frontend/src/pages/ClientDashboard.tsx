import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Refresh,
  TrendingUp,
  ShoppingCart,
  Payment,
  CheckCircle,
  Schedule,
  Star,
  Visibility,
  Business,
  Category,
  LocationOn,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../api/client";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";

interface MetricSummary {
  totalPurchases: number;
  totalSpent: number;
  paidPurchases: number;
  pendingPurchases: number;
  averageLeadScore: number;
  recentPurchases: Array<{
    id: number;
    title: string;
    price: number;
    purchased_at: string;
    lead_score: number;
    industry: string;
    company_name: string;
  }>;
}

interface PurchaseTrendData {
  month: string; // YYYY-MM
  totalPurchases: number;
  totalSpent: number;
}

interface IndustryBreakdown {
  industry: string;
  count: number;
  totalSpent: number;
}

export default function ClientDashboard() {
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [purchaseTrends, setPurchaseTrends] = useState<PurchaseTrendData[]>([]);
  const [industryBreakdown, setIndustryBreakdown] = useState<
    IndustryBreakdown[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch summary data
      const { data: summaryData } = await api.get("/api/dashboard/client");
      setSummary(summaryData);

      // Fetch purchase trends data
      const { data: trendsData } = await api.get(
        "/api/dashboard/client/purchase-trends"
      );
      setPurchaseTrends(trendsData);

      // Fetch industry breakdown
      const { data: industryData } = await api.get(
        "/api/dashboard/client/industry-breakdown"
      );
      setIndustryBreakdown(industryData);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const chartData = {
    months: purchaseTrends.map((t) => t.month),
    purchases: purchaseTrends.map((t) => t.totalPurchases),
    spent: purchaseTrends.map((t) => t.totalSpent),
  };

  const industryChartData = {
    industries: industryBreakdown.map((i) => i.industry),
    counts: industryBreakdown.map((i) => i.count),
    spent: industryBreakdown.map((i) => i.totalSpent),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

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
          Client Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ShoppingCart />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Purchases
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary?.totalPurchases ?? 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary?.paidPurchases ?? 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <Payment />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Spent
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {formatPrice(summary?.totalSpent ?? 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <Star />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg Lead Score
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {((summary?.averageLeadScore ?? 0) * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Purchase Trends */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Purchase Trends
            </Typography>
            {chartData.months.length > 0 ? (
              <LineChart
                height={300}
                series={[
                  {
                    data: chartData.purchases,
                    label: "Purchases",
                    area: true,
                    showMark: true,
                    color: "#1976d2",
                  },
                  {
                    data: chartData.spent,
                    label: "Total Spent (₹)",
                    showMark: true,
                    color: "#FF7F50",
                  },
                ]}
                xAxis={[
                  {
                    data: chartData.months,
                    scaleType: "point",
                  },
                ]}
                yAxis={[{ label: "Value" }]}
                margin={{ left: 50, right: 20, top: 30, bottom: 30 }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={300}
              >
                <Typography variant="body2" color="text.secondary">
                  No purchase data available yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Industry Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Industry Breakdown
            </Typography>
            {industryChartData.industries.length > 0 ? (
              <BarChart
                height={300}
                series={[
                  {
                    data: industryChartData.counts,
                    label: "Purchases",
                    color: "#1976d2",
                  },
                ]}
                xAxis={[
                  {
                    data: industryChartData.industries,
                    scaleType: "band",
                  },
                ]}
                yAxis={[{ label: "Count" }]}
                margin={{ left: 50, right: 20, top: 30, bottom: 100 }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={300}
              >
                <Typography variant="body2" color="text.secondary">
                  No industry data available yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Purchases */}
      {summary?.recentPurchases && summary.recentPurchases.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Purchases
          </Typography>
          <Grid container spacing={2}>
            {summary.recentPurchases.slice(0, 6).map((purchase) => (
              <Grid item xs={12} sm={6} md={4} key={purchase.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" noWrap>
                        {purchase.title}
                      </Typography>
                      <Chip
                        label={`${(purchase.lead_score * 100).toFixed(0)}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {purchase.company_name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2">
                        {purchase.industry}
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        {formatPrice(purchase.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(purchase.purchased_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Visibility />}
            component="a"
            href="/marketplace"
          >
            Browse Leads
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShoppingCart />}
            component="a"
            href="/orders"
          >
            View Orders
          </Button>
          <Button
            variant="outlined"
            startIcon={<Business />}
            component="a"
            href="/cart"
          >
            Shopping Cart
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
