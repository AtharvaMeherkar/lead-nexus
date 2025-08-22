import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  InputAdornment,
  Divider,
  Paper,
  Badge,
  Avatar,
  CardHeader,
  Rating,
} from "@mui/material";
import {
  Search,
  FilterList,
  ExpandMore,
  LocationOn,
  Business,
  Category,
  AttachMoney,
  Star,
  Visibility,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  Schedule,
  Clear,
  Refresh,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../api/client";
import CheckoutDialog from "./CheckoutDialog";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../features/cart/cartSlice";
import { Link } from "react-router-dom";
import { RootState } from "../store";

interface LeadItem {
  id: number;
  title: string;
  industry: string;
  price: number;
  score: number;
  location: string;
  company_name: string;
  contact_name: string;
  description: string;
  created_at: string;
  status: string;
  extra?: {
    annual_revenue?: string;
    employee_count?: string;
    website?: string;
    linkedin?: string;
    [key: string]: any;
  };
}

const INDUSTRIES = [
  "All Industries",
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Legal",
  "Marketing",
  "Food & Beverage",
  "Construction",
  "Consulting",
  "Non-Profit",
  "E-commerce",
];

const LOCATIONS = [
  "All Locations",
  "San Francisco CA",
  "New York NY",
  "Chicago IL",
  "Boston MA",
  "Los Angeles CA",
  "Detroit MI",
  "Miami FL",
  "Washington DC",
  "Seattle WA",
  "Austin TX",
  "Dallas TX",
  "Denver CO",
  "Portland OR",
  "Atlanta GA",
  "San Diego CA",
];

export default function Marketplace() {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LeadItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const dispatch = useDispatch();
  const { token, role } = useSelector((state: RootState) => state.auth);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedIndustry !== "All Industries") {
        params.industry = selectedIndustry;
      }
      if (selectedLocation !== "All Locations") {
        params.location = selectedLocation;
      }
      if (priceRange[0] > 0) {
        params.min_price = priceRange[0];
      }
      if (priceRange[1] < 1000) {
        params.max_price = priceRange[1];
      }

      const { data } = await api.get("/api/leads", { params });
      setItems(data.items);
      setFilteredItems(data.items);
    } catch (err: any) {
      console.error("Failed to fetch leads:", err);
      setError(
        err.response?.data?.error || "Failed to load leads. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Apply search and sorting filters
  useEffect(() => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item.title &&
            item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.company_name &&
            item.company_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.contact_name &&
            item.contact_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "score":
        filtered.sort((a, b) => b.score - a.score);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, sortBy]);

  const onPurchase = async (leadId: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/payments/create-intent", {
        lead_id: leadId,
      });
      setClientSecret(data.client_secret);
      setCurrentLeadId(leadId);
      setCheckoutOpen(true);
    } catch (err: any) {
      console.error("Failed to initiate purchase:", err);
      setError(
        err.response?.data?.error ||
          "Failed to initiate purchase. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onCheckoutClose = () => {
    setCheckoutOpen(false);
    setClientSecret(null);
    setCurrentLeadId(null);
  };

  const onCheckoutSuccess = async () => {
    onCheckoutClose();
    setTimeout(fetchLeads, 1200);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("All Industries");
    setSelectedLocation("All Locations");
    setPriceRange([0, 1000]);
    setSortBy("relevance");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "success";
    if (score >= 0.6) return "warning";
    return "error";
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
          Lead Marketplace
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchLeads}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search leads by title, company, contact, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Filters */}
      <Accordion
        expanded={filtersExpanded}
        onChange={() => setFiltersExpanded(!filtersExpanded)}
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">Advanced Filters</Typography>
            <Chip
              label={`${filteredItems.length} results`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  label="Industry"
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  {INDUSTRIES.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={selectedLocation}
                  label="Location"
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {LOCATIONS.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="score">Lead Score</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Clear />}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) =>
                  setPriceRange(newValue as [number, number])
                }
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={10}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Apply Filters Button */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          onClick={fetchLeads}
          disabled={loading}
          startIcon={<FilterList />}
          size="large"
        >
          Apply Filters
        </Button>
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
            <Search sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No leads found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Try adjusting your search criteria or filters to find more leads.
            </Typography>
            <Button variant="outlined" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Leads Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {getIndustryIcon(item.industry || "technology")}
                    </Avatar>
                  }
                  action={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={`${((item.score || 0.5) * 100).toFixed(0)}%`}
                        color={getScoreColor(item.score || 0.5) as any}
                        size="small"
                        icon={<Star />}
                      />
                      <Chip
                        label={item.status || "available"}
                        color={
                          (item.status || "available") === "available"
                            ? "success"
                            : "error"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  title={
                    <Typography variant="h6" noWrap>
                      {item.title || "Lead Title"}
                    </Typography>
                  }
                  subheader={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.company_name ||
                          "Company information available after purchase"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Listed{" "}
                        {item.created_at
                          ? formatDate(item.created_at)
                          : "Recently"}
                      </Typography>
                    </Box>
                  }
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {item.description && item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description ||
                        "High-quality lead with strong conversion potential."}
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2">
                        {item.industry || "Technology"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">
                        {item.location || "Location available after purchase"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2">
                        {item.contact_name ||
                          "Contact information available after purchase"}
                      </Typography>
                    </Box>
                  </Stack>

                  {item.extra?.employee_count && (
                    <Chip
                      label={`${item.extra.employee_count} employees`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  )}
                  {item.extra?.annual_revenue && (
                    <Chip
                      label={`Revenue: ${item.extra.annual_revenue}`}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    ${(item.price || 0).toFixed(2)}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/marketplace/${item.id || 0}`}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        role === "vendor"
                          ? "Vendors cannot purchase leads"
                          : "Add to Cart"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          dispatch(
                            addItem({
                              id: item.id || 0,
                              title: item.title || "Lead Title",
                              price: item.price || 0,
                            })
                          )
                        }
                        disabled={!token || role === "vendor"}
                        sx={{
                          cursor: role === "vendor" ? "not-allowed" : "pointer",
                          opacity: role === "vendor" ? 0.5 : 1,
                        }}
                      >
                        <ShoppingCart />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        role === "vendor"
                          ? "Vendors cannot purchase leads"
                          : "Purchase Lead"
                      }
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onPurchase(item.id || 0)}
                        disabled={
                          !token ||
                          loading ||
                          role === "vendor" ||
                          (item.status || "available") !== "available"
                        }
                        sx={{
                          cursor: role === "vendor" ? "not-allowed" : "pointer",
                          opacity: role === "vendor" ? 0.5 : 1,
                        }}
                      >
                        Purchase
                      </Button>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        clientSecret={clientSecret}
        onClose={onCheckoutClose}
        onSuccess={onCheckoutSuccess}
        leadId={currentLeadId || undefined}
        isCartCheckout={false}
      />
    </Box>
  );
}
