import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  CheckCircle,
  Business,
  TrendingUp,
  Security,
  Support,
  WhatsApp,
  VideoCall,
  CalendarToday,
} from "@mui/icons-material";
import { motion } from "framer-motion";

export default function ContactSales() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    employees: "",
    industry: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setSuccess(true);

    // Reset form after success
    setTimeout(() => {
      setSuccess(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        employees: "",
        industry: "",
        message: "",
      });
    }, 3000);
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const enterpriseFeatures = [
    "Unlimited Indian B2B leads",
    "Custom AI models trained on Indian market data",
    "Dedicated Indian account manager",
    "99.9% uptime SLA with local support",
    "On-premise deployment options",
    "Advanced security & compliance",
    "Custom integrations with Indian CRMs",
    "WhatsApp Business API integration",
    "Regional analytics & insights",
    "Priority phone & email support",
  ];

  const contactMethods = [
    {
      icon: <Phone />,
      title: "Phone Support",
      description: "Call us during business hours",
      contact: "+91 98765 43210",
      available: "Mon-Fri, 9 AM - 7 PM IST",
    },
    {
      icon: <WhatsApp />,
      title: "WhatsApp Business",
      description: "Quick responses via WhatsApp",
      contact: "+91 98765 43210",
      available: "24/7 automated, business hours for live chat",
    },
    {
      icon: <Email />,
      title: "Email Support",
      description: "Detailed inquiries and proposals",
      contact: "enterprise@lead-nexus.in",
      available: "Response within 2 hours",
    },
    {
      icon: <VideoCall />,
      title: "Video Demo",
      description: "Schedule a personalized demo",
      contact: "Book a 30-minute demo",
      available: "Available Mon-Sat",
    },
  ];

  const salesTeam = [
    {
      name: "Rajesh Kumar",
      role: "Enterprise Sales Director",
      location: "Mumbai, Maharashtra",
      avatar: "/api/placeholder/64/64",
      expertise: "Large Enterprise Solutions",
    },
    {
      name: "Priya Sharma",
      role: "SMB Sales Manager",
      location: "Bangalore, Karnataka",
      avatar: "/api/placeholder/64/64",
      expertise: "Small & Medium Business",
    },
    {
      name: "Amit Singh",
      role: "Technical Sales Engineer",
      location: "Delhi, NCR",
      avatar: "/api/placeholder/64/64",
      expertise: "Technical Integration",
    },
  ];

  if (success) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Thank you for your interest!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Our sales team will contact you within 2 hours during business
            hours.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We've received your information and are excited to show you how
            Lead-Nexus can transform your B2B sales process in the Indian
            market.
          </Typography>
        </motion.div>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "#fff",
        }}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" fontWeight={800} gutterBottom>
                  Ready to scale your{" "}
                  <Box component="span" sx={{ color: "#ffeb3b" }}>
                    Indian B2B sales?
                  </Box>
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
                  Get a personalized demo and see how Lead-Nexus can help your
                  business grow in the Indian market.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    icon={<LocationOn />}
                    label="Made in India"
                    sx={{ color: "#fff", borderColor: "#fff" }}
                    variant="outlined"
                  />
                  <Chip
                    icon={<Security />}
                    label="Enterprise Security"
                    sx={{ color: "#fff", borderColor: "#fff" }}
                    variant="outlined"
                  />
                  <Chip
                    icon={<Support />}
                    label="24/7 Support"
                    sx={{ color: "#fff", borderColor: "#fff" }}
                    variant="outlined"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Enterprise Features Include:
                  </Typography>
                  <List dense>
                    {enterpriseFeatures.slice(0, 6).map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle
                            sx={{ fontSize: 20, color: "primary.main" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    + {enterpriseFeatures.length - 6} more enterprise features
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={7}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Get a Personalized Demo
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Fill out the form below and our sales team will contact you
                  within 2 hours to schedule a demo tailored to your business
                  needs.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange("firstName")}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange("lastName")}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Business Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange("phone")}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company Name"
                        value={formData.company}
                        onChange={handleInputChange("company")}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Job Title"
                        value={formData.jobTitle}
                        onChange={handleInputChange("jobTitle")}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Company Size"
                        value={formData.employees}
                        onChange={handleInputChange("employees")}
                        SelectProps={{ native: true }}
                        required
                      >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-1000">201-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Industry"
                        value={formData.industry}
                        onChange={handleInputChange("industry")}
                        SelectProps={{ native: true }}
                        required
                      >
                        <option value="">Select industry</option>
                        <option value="technology">Technology</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance & Banking</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail & E-commerce</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Tell us about your sales challenges"
                        value={formData.message}
                        onChange={handleInputChange("message")}
                        placeholder="What are your current B2B sales challenges? How many leads do you need per month?"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CalendarToday />
                          )
                        }
                        sx={{ py: 1.5, px: 4, fontSize: "1.1rem" }}
                      >
                        {loading ? "Submitting..." : "Schedule Demo"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={4}>
              {/* Contact Methods */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Get in Touch
                </Typography>
                <Stack spacing={3}>
                  {contactMethods.map((method, index) => (
                    <Card key={index} sx={{ p: 3, borderRadius: 2 }}>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: "primary.main",
                            color: "#fff",
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {method.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {method.description}
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            color="primary"
                          >
                            {method.contact}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {method.available}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </motion.div>

              {/* Sales Team */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Meet Our Sales Team
                </Typography>
                <Stack spacing={2}>
                  {salesTeam.map((member, index) => (
                    <Card key={index} sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={member.avatar}
                          sx={{ width: 50, height: 50 }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.role}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            📍 {member.location} • {member.expertise}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    color: "#fff",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Why Choose Lead-Nexus?
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h4" fontWeight={800}>
                        500+
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Happy Clients
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h4" fontWeight={800}>
                        ₹50L+
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Revenue Generated
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h4" fontWeight={800}>
                        99.9%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Uptime SLA
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h4" fontWeight={800}>
                        24/7
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Support
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: "#f8f9fa" }}>
        <Container>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            gutterBottom
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6 }}
          >
            Common questions about our Enterprise solution
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                question: "How quickly can we get started?",
                answer:
                  "Enterprise setup typically takes 2-3 weeks including data migration, team training, and custom configurations.",
              },
              {
                question: "Do you support Indian compliance requirements?",
                answer:
                  "Yes, we're fully compliant with Indian data protection laws, GST requirements, and industry-specific regulations.",
              },
              {
                question: "Can you integrate with our existing CRM?",
                answer:
                  "We support integrations with popular Indian CRMs like Salesforce, HubSpot, Zoho, and can build custom integrations.",
              },
              {
                question: "What kind of support do you provide?",
                answer:
                  "Enterprise customers get dedicated account managers, 24/7 phone support, and priority technical assistance.",
              },
              {
                question: "Is on-premise deployment available?",
                answer:
                  "Yes, we offer on-premise and hybrid cloud deployments for enterprises with specific security requirements.",
              },
              {
                question: "How does pricing work for Enterprise?",
                answer:
                  "Enterprise pricing is customized based on your team size, data volume, and feature requirements. Contact us for a quote.",
              },
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ p: 3, h: "100%" }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {faq.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}

