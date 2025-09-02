import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Insights,
  Assessment,
  Download,
  FilterList,
  Refresh,
  Visibility,
  TrendingFlat,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

interface AnalyticsData {
  key_metrics: {
    total_leads: number;
    available_leads: number;
    sold_leads: number;
    total_revenue: number;
    conversion_rate: number;
    average_lead_price: number;
  };
  quality_distribution: {
    hot: number;
    warm: number;
    cold: number;
    dead: number;
  };
  industry_performance: Array<{
    industry: string;
    total_leads: number;
    revenue: number;
    average_score: number;
  }>;
  recent_activity: Array<{
    type: string;
    title: string;
    industry?: string;
    price?: number;
    amount?: number;
    timestamp: string;
  }>;
}

interface PredictiveInsight {
  type: string;
  confidence: number;
  prediction: string;
  factors: string[];
  timeframe: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchAnalyticsData();
    fetchPredictiveInsights();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:5001/api/analytics/real-time",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictiveInsights = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/analytics/predictive-insights",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/analytics/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            report_type: reportType,
            filters: {},
            start_date: dateRange.start,
            end_date: dateRange.end,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Handle report data (download, display, etc.)
        console.log("Report generated:", data);
        setReportDialogOpen(false);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
  };

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp color="success" />;
    if (value < threshold) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "error";
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: "center" }}>
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No analytics data available
      </Alert>
    );
  }

  const qualityData = [
    {
      name: "Hot",
      value: analyticsData.quality_distribution.hot,
      color: "#FF4444",
    },
    {
      name: "Warm",
      value: analyticsData.quality_distribution.warm,
      color: "#FF8800",
    },
    {
      name: "Cold",
      value: analyticsData.quality_distribution.cold,
      color: "#00AAFF",
    },
    {
      name: "Dead",
      value: analyticsData.quality_distribution.dead,
      color: "#666666",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            Advanced Analytics Dashboard
          </Typography>
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchAnalyticsData} sx={{ mr: 1 }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Assessment />}
              onClick={() => setReportDialogOpen(true)}
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <CardContent sx={{ color: "white" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {analyticsData.key_metrics.total_leads}
                      </Typography>
                      <Typography variant="body2">Total Leads</Typography>
                    </Box>
                    <Analytics sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                }}
              >
                <CardContent sx={{ color: "white" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        ₹
                        {analyticsData.key_metrics.total_revenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">Total Revenue</Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                }}
              >
                <CardContent sx={{ color: "white" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {analyticsData.key_metrics.conversion_rate.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">Conversion Rate</Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                }}
              >
                <CardContent sx={{ color: "white" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        ₹
                        {analyticsData.key_metrics.average_lead_price.toFixed(
                          0
                        )}
                      </Typography>
                      <Typography variant="body2">Avg Lead Price</Typography>
                    </Box>
                    <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Charts and Insights */}
        <Grid container spacing={3}>
          {/* Lead Quality Distribution */}
          <Grid item xs={12} md={6}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Lead Quality Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={qualityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {qualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Industry Performance */}
          <Grid item xs={12} md={6}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Industry Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.industry_performance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="industry" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Predictive Insights */}
          <Grid item xs={12}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Insights sx={{ mr: 1 }} />
                    <Typography variant="h6">Predictive Insights</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {insights.map((insight, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {insight.type.replace(/_/g, " ").toUpperCase()}
                            </Typography>
                            <Chip
                              label={`${(insight.confidence * 100).toFixed(
                                0
                              )}%`}
                              color={
                                getConfidenceColor(insight.confidence) as any
                              }
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {insight.prediction}
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {insight.factors.map((factor, factorIndex) => (
                              <Chip
                                key={factorIndex}
                                label={factor}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: "block" }}
                          >
                            Timeframe: {insight.timeframe}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Activity
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Industry</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analyticsData.recent_activity.map(
                          (activity, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Chip
                                  label={activity.type.replace(/_/g, " ")}
                                  size="small"
                                  color={
                                    activity.type === "lead_purchased"
                                      ? "success"
                                      : "primary"
                                  }
                                />
                              </TableCell>
                              <TableCell>{activity.title}</TableCell>
                              <TableCell>{activity.industry || "-"}</TableCell>
                              <TableCell>
                                {activity.amount
                                  ? `₹${activity.amount}`
                                  : activity.price
                                  ? `₹${activity.price}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  activity.timestamp
                                ).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Report Generation Dialog */}
        <Dialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Generate Custom Report</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="lead_performance">Lead Performance</MenuItem>
                <MenuItem value="vendor_performance">
                  Vendor Performance
                </MenuItem>
                <MenuItem value="revenue_analysis">Revenue Analysis</MenuItem>
                <MenuItem value="conversion_funnel">Conversion Funnel</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
            <Button onClick={generateReport} variant="contained">
              Generate Report
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default AdvancedAnalytics;
