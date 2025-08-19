import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Email,
  Phone,
  Business,
  Person,
  CheckCircle,
  Star,
  Schedule,
  Support,
} from "@mui/icons-material";
import { useState } from "react";

interface SalesTeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  description: string;
}

const salesTeam: SalesTeamMember[] = [
  {
    name: "Sarah Johnson",
    role: "Head of Sales",
    email: "sarah.johnson@lead-nexus.com",
    phone: "+1 (555) 123-4567",
    avatar: "SJ",
    description:
      "Enterprise sales specialist with 8+ years in B2B lead management",
  },
  {
    name: "Michael Chen",
    role: "Enterprise Account Manager",
    email: "michael.chen@lead-nexus.com",
    phone: "+1 (555) 234-5678",
    avatar: "MC",
    description: "Custom solution architect for large enterprise clients",
  },
  {
    name: "Emily Rodriguez",
    role: "Sales Development Manager",
    email: "emily.rodriguez@lead-nexus.com",
    phone: "+1 (555) 345-6789",
    avatar: "ER",
    description: "Specializes in scaling solutions for growing businesses",
  },
];

export default function ContactSalesPage() {
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    companySize: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Container sx={{ py: 6 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Contact Sales
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          maxWidth={600}
          mx="auto"
        >
          Ready to scale your lead generation? Our enterprise sales team is here
          to help you build a custom solution that fits your business needs.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Enterprise Plan Details */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Enterprise Plan
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                Custom Pricing
              </Typography>
              <Typography color="text.secondary" paragraph>
                Tailored solutions for large organizations with specific
                requirements.
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Everything in Professional" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Unlimited leads & API access" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Custom AI models & integrations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Dedicated account manager" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="SLA guarantees & priority support" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Custom training & onboarding" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Get in Touch
              </Typography>
              <Typography color="text.secondary" paragraph>
                Tell us about your business needs and we'll create a custom
                proposal for you.
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you! Our sales team will contact you within 24 hours.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={contactForm.firstName}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={contactForm.lastName}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={contactForm.company}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Size"
                      select
                      value={contactForm.companySize}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          companySize: e.target.value,
                        }))
                      }
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select size</option>
                      <option value="10-50">10-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tell us about your needs"
                      multiline
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Describe your lead generation goals, current challenges, and any specific requirements..."
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={submitted}
                    >
                      {submitted ? "Message Sent!" : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={6}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          Meet Our Sales Team
        </Typography>
        <Typography color="text.secondary" textAlign="center" mb={4}>
          Our experienced sales professionals are ready to help you succeed.
        </Typography>

        <Grid container spacing={3}>
          {salesTeam.map((member) => (
            <Grid item xs={12} md={4} key={member.name}>
              <Card sx={{ height: "100%", textAlign: "center" }}>
                <CardContent>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 2,
                      bgcolor: "primary.main",
                      fontSize: "1.5rem",
                    }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {member.role}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {member.description}
                  </Typography>
                  <Stack spacing={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{member.email}</Typography>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{member.phone}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Why Choose Enterprise */}
      <Box mt={6}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          Why Choose Enterprise?
        </Typography>

        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
              <Star sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Custom Solutions
              </Typography>
              <Typography color="text.secondary">
                Tailored AI models and integrations built specifically for your
                business needs.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
              <Support sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Dedicated Support
              </Typography>
              <Typography color="text.secondary">
                Your own account manager with priority support and SLA
                guarantees.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
              <Business sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Unlimited Scale
              </Typography>
              <Typography color="text.secondary">
                No limits on leads, API calls, or team members. Scale as you
                grow.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
              <Schedule sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fast Implementation
              </Typography>
              <Typography color="text.secondary">
                Custom training, onboarding, and implementation support
                included.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
