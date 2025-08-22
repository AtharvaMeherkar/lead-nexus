import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PaymentIcon from "@mui/icons-material/Payment";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GroupsIcon from "@mui/icons-material/Groups";
import HubIcon from "@mui/icons-material/Hub";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import AnimatedCard from "../components/AnimatedCard";

export default function Landing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg,#0D47A1,#00ACC1)",
          color: "#fff",
          minHeight: { xs: "60vh", md: "70vh" },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Chip
              label="AI-Driven B2B Leads"
              color="secondary"
              sx={{ mb: 2 }}
            />
            <Typography
              variant={isMobile ? "h4" : "h3"}
              fontWeight={800}
              gutterBottom
              sx={{
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              Discover. Validate. Win More Deals.
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              maxWidth={760}
              sx={{
                opacity: 0.92,
                fontSize: { xs: "1rem", md: "1.25rem" },
                lineHeight: 1.6,
              }}
            >
              Lead-Nexus connects Clients and Vendors with automated validation,
              smart scoring, and a streamlined purchasing experience—so you
              focus on closing, not cleaning data.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mt={4}
              sx={{
                justifyContent: { xs: "stretch", sm: "flex-start" },
                "& .MuiButton-root": {
                  minHeight: { xs: "48px", md: "56px" },
                  fontSize: { xs: "1rem", md: "1.125rem" },
                },
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  to="/marketplace"
                  sx={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Browse Marketplace
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{
                    borderWidth: "2px",
                    "&:hover": {
                      borderWidth: "2px",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Login
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{
                    borderWidth: "2px",
                    "&:hover": {
                      borderWidth: "2px",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Create Account
                </Button>
              </motion.div>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Value Props */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            textAlign="center"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 4 }}
          >
            Why Choose Lead-Nexus?
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {[
            {
              icon: <AutoFixHighIcon fontSize="large" color="primary" />,
              title: "Automated Validation",
              text: "Upload CSVs and let our system validate fields, detect duplicates, and prepare clean, trustworthy data.",
            },
            {
              icon: <InsightsIcon fontSize="large" color="primary" />,
              title: "Smart Scoring",
              text: "AI-powered lead scoring gives instant quality insights, accelerating prioritization and ROI.",
            },
            {
              icon: <PaymentIcon fontSize="large" color="primary" />,
              title: "Seamless Checkout",
              text: "Add to cart, review, and purchase—simple, clear, with real-time order tracking and receipts.",
            },
          ].map((card, i) => (
            <Grid key={i} item xs={12} md={4}>
              <AnimatedCard
                delay={i * 0.2}
                sx={{
                  p: { xs: 2, md: 3 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ textAlign: "center", mb: 2 }}>{card.icon}</Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  textAlign="center"
                  fontWeight={600}
                  gutterBottom
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ flexGrow: 1 }}
                >
                  {card.text}
                </Typography>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Metrics */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: "#f0f5ff" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              textAlign="center"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 4 }}
            >
              Enterprise-Grade Performance
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {[
              {
                label: "<1s",
                sub: "Search latency",
                icon: <SpeedIcon color="primary" />,
              },
              {
                label: "AES-256",
                sub: "Data at rest",
                icon: <SecurityIcon color="primary" />,
              },
              {
                label: "TLS 1.3",
                sub: "In transit",
                icon: <SecurityIcon color="primary" />,
              },
            ].map((m, i) => (
              <Grid key={i} item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <AnimatedCard
                    delay={i * 0.2}
                    sx={{
                      p: { xs: 2, md: 3 },
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{m.icon}</Box>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      fontWeight={700}
                      gutterBottom
                    >
                      {m.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {m.sub}
                    </Typography>
                  </AnimatedCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container sx={{ py: { xs: 8, md: 10 }, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight={700}
            gutterBottom
            sx={{
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            Ready to level up your pipeline?
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            Join vendors and clients boosting revenue with clean, high-quality
            leads.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{
              "& .MuiButton-root": {
                minHeight: { xs: "48px", md: "56px" },
                fontSize: { xs: "1rem", md: "1.125rem" },
              },
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/marketplace"
                sx={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Start Browsing
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/register"
                sx={{
                  borderWidth: "2px",
                  "&:hover": {
                    borderWidth: "2px",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Create Free Account
              </Button>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>

      {/* Why Lead-Nexus */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={700}>
              Why businesses choose Lead‑Nexus
            </Typography>
            <List>
              {[
                "High-quality, validated B2B leads",
                "Faster go‑to‑market with AI scoring",
                "Transparent vendor reputation & order history",
                "Simple cart checkout and central receipts",
              ].map((t, i) => (
                <ListItem key={i} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={t} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Most interesting features</Typography>
              <Grid container spacing={2} mt={0.5}>
                {[
                  {
                    icon: <AutoFixHighIcon color="primary" />,
                    text: "Automated CSV validation & duplicate detection",
                  },
                  {
                    icon: <InsightsIcon color="primary" />,
                    text: "Predictive lead scoring (pluggable ML model)",
                  },
                  {
                    icon: <HubIcon color="primary" />,
                    text: "Cart checkout with secure mock payment processing",
                  },
                  {
                    icon: <GroupsIcon color="primary" />,
                    text: "Role‑based dashboards for Clients & Vendors",
                  },
                  {
                    icon: <PaymentIcon color="primary" />,
                    text: "Order history with receipts & statuses",
                  },
                  {
                    icon: <AutoGraphIcon color="primary" />,
                    text: "Vendor revenue & client spend analytics",
                  },
                ].map((f, i) => (
                  <Grid key={i} item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {f.icon}
                      <Typography variant="body2">{f.text}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* How it works */}
      <Box sx={{ py: 8, backgroundColor: "#fafafa" }}>
        <Container>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
            How it works
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "1. Sign up & set your role",
                text: "Create a Client account to buy leads or a Vendor account to upload and sell.",
              },
              {
                title: "2. Upload or browse",
                text: "Vendors upload CSVs for instant validation. Clients search & filter the marketplace.",
              },
              {
                title: "3. Add to cart & checkout",
                text: "Confirm payment with our secure mock payment system. Orders are recorded and leads are marked as sold.",
              },
            ].map((s, i) => (
              <Grid key={i} item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6">{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {s.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Security & Compliance */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={700} mb={2}>
          Security & Compliance by design
        </Typography>
        <Grid container spacing={3}>
          {[
            { label: "AES‑256 at rest" },
            { label: "TLS 1.3 in transit" },
            { label: "RBAC & JWT auth" },
            { label: "GDPR/CCPA ready" },
          ].map((b, i) => (
            <Grid key={i} item>
              <Chip label={b.label} color="primary" variant="outlined" />
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary">
          Lead‑Nexus emphasizes privacy and data quality from ingestion to
          purchase. Export receipts and track every order in one place.
        </Typography>
      </Container>

      {/* Final CTA */}
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700}>
          Start with the Marketplace
        </Typography>
        <Typography mt={1} color="text.secondary">
          Find high‑intent leads today—validate, score, and purchase in minutes.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          mt={3}
        >
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/marketplace"
          >
            Explore Leads
          </Button>
          <Button variant="outlined" size="large" component={Link} to="/orders">
            View Orders
          </Button>
        </Stack>
      </Container>
    </>
  );
}
