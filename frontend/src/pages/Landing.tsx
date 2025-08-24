import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  Fade,
} from "@mui/material";
import {
  TrendingUp,
  People,
  Analytics,
  Security,
  Speed,
  Star,
  PlayArrow,
  CheckCircle,
  ArrowForward,
  BusinessCenter,
  Campaign,
  AutoGraph,
  Psychology,
  Insights,
  RocketLaunch,
  EmojiEvents,
  Groups,
  VerifiedUser,
  Language,
  CurrencyRupee,
  LocationOn,
  Phone,
  Email,
  WhatsApp,
  TrendingFlat,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import AnimatedCard from "../components/AnimatedCard";

export default function Landing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentStat, setCurrentStat] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -25]);

  // Rotating stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "10,000+", sub: "Active Leads", icon: <TrendingUp /> },
    { label: "₹50L+", sub: "Revenue Generated", icon: <CurrencyRupee /> },
    { label: "500+", sub: "Happy Clients", icon: <EmojiEvents /> },
    { label: "99.9%", sub: "Uptime", icon: <VerifiedUser /> },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Sales Director",
      company: "TechFlow Solutions",
      avatar: "/api/placeholder/40/40",
      quote:
        "Lead-Nexus transformed our B2B sales process. We increased our conversion rate by 300% in just 3 months!",
    },
    {
      name: "Rahul Gupta",
      role: "Founder",
      company: "StartupHub India",
      avatar: "/api/placeholder/40/40",
      quote:
        "The AI-powered lead scoring is incredible. We now focus only on high-quality prospects.",
    },
    {
      name: "Anjali Patel",
      role: "Marketing Head",
      company: "DigitalFirst",
      avatar: "/api/placeholder/40/40",
      quote: "Best investment we made this year. ROI was visible from day one!",
    },
  ];

  return (
    <>
      {/* Hero Section - Apollo.io Inspired */}
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main} 0%, 
            ${theme.palette.secondary.main} 50%, 
            ${theme.palette.primary.dark} 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `radial-gradient(circle at 20% 80%, ${theme.palette.secondary.light} 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${theme.palette.primary.light} 0%, transparent 50%)`,
          }}
        />

        <motion.div
          style={{ y: y1 }}
          className="floating-shape"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              right: "10%",
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: alpha(theme.palette.secondary.light, 0.2),
              animation: "float 6s ease-in-out infinite",
            }}
          />
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              left: "15%",
              width: 60,
              height: 60,
              borderRadius: "20%",
              background: alpha(theme.palette.primary.light, 0.2),
              animation: "float 4s ease-in-out infinite reverse",
            }}
          />
        </motion.div>

        <Container sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Chip
                    icon={<LocationOn />}
                    label="Made in India 🇮🇳"
                    color="secondary"
                    sx={{ fontSize: "0.9rem" }}
                  />
                  <Chip
                    label="AI-Powered"
                    variant="outlined"
                    sx={{ color: "#fff", borderColor: "#fff" }}
                  />
                </Stack>

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 2,
                    background: "linear-gradient(45deg, #fff, #e3f2fd)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Meet your AI{" "}
                  <Box
                    component="span"
                    sx={{ color: theme.palette.secondary.main }}
                  >
                    B2B Lead
                  </Box>{" "}
                  Engine
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    fontWeight: 400,
                    opacity: 0.9,
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  Find and research Indian B2B leads, personalize messaging with
                  AI, and launch campaigns in minutes — not hours. Built for the
                  Indian market with ₹ pricing and local insights.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/register"
                      startIcon={<RocketLaunch />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        background: theme.palette.secondary.main,
                        "&:hover": {
                          background: theme.palette.secondary.dark,
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Start Free Trial
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/marketplace"
                      startIcon={<PlayArrow />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: "#fff",
                        color: "#fff",
                        "&:hover": {
                          borderColor: theme.palette.secondary.main,
                          backgroundColor: alpha(
                            theme.palette.secondary.main,
                            0.1
                          ),
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Watch Demo
                    </Button>
                  </motion.div>
                </Stack>

                <Stack direction="row" spacing={4} alignItems="center">
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Trusted by 500+ Indian businesses
                  </Typography>
                  <Stack direction="row" spacing={-1}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Avatar
                        key={i}
                        sx={{
                          width: 32,
                          height: 32,
                          border: "2px solid #fff",
                          fontSize: "0.8rem",
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </Avatar>
                    ))}
                  </Stack>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      background:
                        "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
                      minHeight: 400,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h6" color="primary" gutterBottom>
                      Live Dashboard Preview
                    </Typography>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStat}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Box
                            sx={{ color: theme.palette.primary.main, mb: 2 }}
                          >
                            {stats[currentStat].icon}
                          </Box>
                          <Typography
                            variant="h2"
                            color="primary"
                            fontWeight={800}
                          >
                            {stats[currentStat].label}
                          </Typography>
                          <Typography variant="h6" color="text.secondary">
                            {stats[currentStat].sub}
                          </Typography>
                        </Box>
                      </motion.div>
                    </AnimatePresence>

                    <Stack direction="row" spacing={1} justifyContent="center">
                      {stats.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor:
                              index === currentStat
                                ? theme.palette.primary.main
                                : alpha(theme.palette.primary.main, 0.3),
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Floating Action Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <IconButton sx={{ color: "#fff", opacity: 0.7 }}>
              <ArrowForward sx={{ transform: "rotate(90deg)" }} />
            </IconButton>
          </motion.div>
        </motion.div>
      </Box>

      {/* Companies Section */}
      <Box sx={{ py: 6, backgroundColor: "#f8f9fa" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Join 500+ Indian businesses using Lead-Nexus
            </Typography>

            <Grid
              container
              spacing={4}
              alignItems="center"
              justifyContent="center"
            >
              {[
                "TechFlow Solutions",
                "StartupHub India",
                "DigitalFirst",
                "InnovateX",
                "BusinessPro",
                "SalesForce India",
              ].map((company, index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        "&:hover": {
                          boxShadow: theme.shadows[4],
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        {company}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section - Apollo.io Style */}
      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h2" fontWeight={800} gutterBottom>
              Everything you need to sell,{" "}
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                scale, and succeed
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Built specifically for Indian B2B markets with local insights, ₹
              pricing, and features that understand your business needs.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {[
            {
              icon: <Psychology fontSize="large" />,
              title: "AI Lead Scoring",
              description:
                "Advanced AI algorithms score leads based on Indian market patterns and business behaviors.",
              color: theme.palette.primary.main,
              features: [
                "Smart lead prioritization",
                "Predictive analytics",
                "ROI optimization",
              ],
            },
            {
              icon: <Campaign fontSize="large" />,
              title: "Multi-channel Outreach",
              description:
                "Reach prospects through email, WhatsApp, phone calls, and LinkedIn - all from one platform.",
              color: theme.palette.secondary.main,
              features: [
                "WhatsApp integration",
                "Email sequences",
                "Call tracking",
              ],
            },
            {
              icon: <Analytics fontSize="large" />,
              title: "Indian Market Data",
              description:
                "Access to 10M+ Indian business contacts with verified phone numbers and email addresses.",
              color: theme.palette.success.main,
              features: [
                "GST verification",
                "Company insights",
                "Contact enrichment",
              ],
            },
            {
              icon: <AutoGraph fontSize="large" />,
              title: "Revenue Intelligence",
              description:
                "Track your sales pipeline with detailed analytics and forecasting built for Indian businesses.",
              color: theme.palette.warning.main,
              features: [
                "Pipeline tracking",
                "Revenue forecasting",
                "Performance insights",
              ],
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    p: 3,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    "&:hover": {
                      boxShadow: theme.shadows[8],
                      borderColor: feature.color,
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      backgroundColor: alpha(feature.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: feature.color,
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {feature.description}
                  </Typography>

                  <List dense>
                    {feature.features.map((item, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle
                            sx={{ fontSize: 16, color: feature.color }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: "#f8f9fa" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              fontWeight={700}
              textAlign="center"
              gutterBottom
            >
              Loved by Indian businesses
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 6 }}
            >
              See how companies across India are growing with Lead-Nexus
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid #e0e0e0",
                      "&:hover": {
                        boxShadow: theme.shadows[8],
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Avatar
                        src={testimonial.avatar}
                        sx={{ width: 50, height: 50 }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="body1"
                      sx={{ fontStyle: "italic", mb: 2 }}
                    >
                      "{testimonial.quote}"
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          sx={{ color: "#ffc107", fontSize: 20 }}
                        />
                      ))}
                    </Stack>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section - Indian Market */}
      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Simple, transparent{" "}
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                Indian pricing
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              No hidden costs. Pay in Indian Rupees. Cancel anytime.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {[
            {
              name: "Starter",
              price: "₹2,999",
              period: "/month",
              description: "Perfect for small businesses and startups",
              features: [
                "1,000 lead credits/month",
                "Basic AI scoring",
                "Email support",
                "WhatsApp integration",
                "Indian market data",
              ],
              popular: false,
            },
            {
              name: "Professional",
              price: "₹7,999",
              period: "/month",
              description: "Best for growing sales teams",
              features: [
                "5,000 lead credits/month",
                "Advanced AI scoring",
                "Priority support",
                "Multi-channel outreach",
                "Advanced analytics",
                "CRM integrations",
                "Team collaboration",
              ],
              popular: true,
            },
            {
              name: "Enterprise",
              price: "₹19,999",
              period: "/month",
              description: "For large organizations",
              features: [
                "Unlimited lead credits",
                "Custom AI models",
                "Dedicated success manager",
                "API access",
                "Custom integrations",
                "Advanced security",
                "SLA guarantee",
              ],
              popular: false,
            },
          ].map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    position: "relative",
                    border: plan.popular
                      ? `2px solid ${theme.palette.primary.main}`
                      : "1px solid #e0e0e0",
                    borderRadius: 3,
                    "&:hover": {
                      boxShadow: theme.shadows[12],
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: -12,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}

                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {plan.name}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="baseline"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h3" fontWeight={800} color="primary">
                      {plan.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    {plan.description}
                  </Typography>

                  <List sx={{ mb: 4 }}>
                    {plan.features.map((feature, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle
                            sx={{
                              fontSize: 20,
                              color: theme.palette.primary.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.popular ? "contained" : "outlined"}
                    size="large"
                    fullWidth
                    component={Link}
                    to="/register"
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Get Started
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" fontWeight={800} gutterBottom>
              Ready to transform your{" "}
              <Box
                component="span"
                sx={{ color: theme.palette.secondary.main }}
              >
                B2B sales?
              </Box>
            </Typography>

            <Typography
              variant="h5"
              sx={{ opacity: 0.9, mb: 4, maxWidth: 600, mx: "auto" }}
            >
              Join thousands of Indian businesses already using Lead-Nexus to
              find, engage, and convert their ideal customers.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/register"
                  startIcon={<RocketLaunch />}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: theme.palette.secondary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.secondary.dark,
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Start Free Trial
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Phone />}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: "#fff",
                    color: "#fff",
                    "&:hover": {
                      borderColor: theme.palette.secondary.main,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Book Demo Call
                </Button>
              </motion.div>
            </Stack>

            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              No credit card required • 14-day free trial • Cancel anytime
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .floating-shape {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
