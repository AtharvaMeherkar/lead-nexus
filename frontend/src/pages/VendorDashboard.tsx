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
  Avatar,
} from "@mui/material";
import {
  Refresh,
  TrendingUp,
  Business,
  Payment,
  CheckCircle,
  Schedule,
  Star,
  Visibility,
  Upload,
  Category,
  LocationOn,
  AttachMoney,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../api/client";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";

interface MetricSummary {
  totalLeads: number;
  soldLeads: number;
  revenue: number;
  averageLeadPrice: number;
  conversionRate: number;
  recentSales: Array<{
    id: number;
    title: string;
    price: number;
    sold_at: string;
    buyer_name: string;
    industry: string;
  }>;
}

interface SalesTrendData {
  month: string; // YYYY-MM
  leadsSold: number;
  revenue: number;
}

interface IndustryPerformance {
  industry: string;
  leadsCount: number;
  soldCount: number;
  revenue: number;
}

export default function VendorDashboard() {
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [salesTrends, setSalesTrends] = useState<SalesTrendData[]>([]);
  const [industryPerformance, setIndustryPerformance] = useState<
    IndustryPerformance[]
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
      const { data: summaryData } = await api.get("/api/dashboard/vendor");
      setSummary(summaryData);

      // Fetch sales trends data
      const { data: trendsData } = await api.get(
        "/api/dashboard/vendor/sales-trends"
      );
      setSalesTrends(trendsData);

      // Fetch industry performance data
      const { data: industryData } = await api.get(
        "/api/dashboard/vendor/industry-performance"
      );
      setIndustryPerformance(industryData);
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
    months: salesTrends.map((t) => t.month),
    leadsSold: salesTrends.map((t) => t.leadsSold),
    revenue: salesTrends.map((t) => t.revenue),
  };

  const industryChartData = {
    industries: industryPerformance.map((i) => i.industry),
    leadsCount: industryPerformance.map((i) => i.leadsCount),
    soldCount: industryPerformance.map((i) => i.soldCount),
    revenue: industryPerformance.map((i) => i.revenue),
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
          Vendor Dashboard
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
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Leads
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary?.totalLeads ?? 0}
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
                    Sold Leads
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {summary?.soldLeads ?? 0}
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
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {formatPrice(summary?.revenue ?? 0)}
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
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {((summary?.conversionRate ?? 0) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Sales Trends */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trends
            </Typography>
            {chartData.months.length > 0 ? (
              <LineChart
                height={300}
                series={[
                  {
                    data: chartData.leadsSold,
                    label: "Leads Sold",
                    area: true,
                    showMark: true,
                    color: "#1976d2",
                  },
                  {
                    data: chartData.revenue,
                    label: "Revenue ($)",
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
                  No sales data available yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Industry Performance */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Industry Performance
            </Typography>
            {industryChartData.industries.length > 0 ? (
              <BarChart
                height={300}
                series={[
                  {
                    data: industryChartData.soldCount,
                    label: "Leads Sold",
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

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    {formatPrice(summary?.averageLeadPrice ?? 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Lead Price
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    color="success.main"
                    fontWeight={700}
                  >
                    {summary?.totalLeads
                      ? (
                          (summary.soldLeads / summary.totalLeads) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sell-through Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">Available Leads</Typography>
                <Chip
                  label={summary ? summary.totalLeads - summary.soldLeads : 0}
                  color="primary"
                  size="small"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">This Month Sales</Typography>
                <Chip
                  label={
                    salesTrends.length > 0
                      ? salesTrends[salesTrends.length - 1].leadsSold
                      : 0
                  }
                  color="success"
                  size="small"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">This Month Revenue</Typography>
                <Chip
                  label={
                    salesTrends.length > 0
                      ? formatPrice(salesTrends[salesTrends.length - 1].revenue)
                      : "$0"
                  }
                  color="warning"
                  size="small"
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Sales */}
      {summary?.recentSales && summary.recentSales.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Sales
          </Typography>
          <Grid container spacing={2}>
            {summary.recentSales.slice(0, 6).map((sale) => (
              <Grid item xs={12} sm={6} md={4} key={sale.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" noWrap>
                        {sale.title}
                      </Typography>
                      <Chip
                        label="Sold"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Sold to: {sale.buyer_name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2">{sale.industry}</Typography>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        {formatPrice(sale.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(sale.sold_at)}
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
            startIcon={<Upload />}
            component="a"
            href="/vendor/upload"
          >
            Upload Leads
          </Button>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            component="a"
            href="/vendor/leads"
          >
            Manage Leads
          </Button>
          <Button
            variant="outlined"
            startIcon={<Payment />}
            component="a"
            href="/vendor/earnings"
          >
            View Earnings
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
