import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import InsightsIcon from "@mui/icons-material/Insights";
import PaymentIcon from "@mui/icons-material/Payment";
import GroupsIcon from "@mui/icons-material/Groups";
import HubIcon from "@mui/icons-material/Hub";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

export default function FeaturesPage() {
  const cards = [
    {
      icon: <AutoFixHighIcon color="primary" />,
      title: "Automated Validation",
      text: "CSV upload with required field checks, type validation, duplicate detection, and contact de-dup.",
    },
    {
      icon: <InsightsIcon color="primary" />,
      title: "Predictive Scoring",
      text: "Pluggable ML scoring; start with rules, upgrade to Random Forest/XGBoost on historicals.",
    },
    {
      icon: <PaymentIcon color="primary" />,
      title: "Checkout & Orders",
      text: "Shopping cart, mock payment processing, order confirmation, receipts, and purchase history.",
    },
    {
      icon: <GroupsIcon color="primary" />,
      title: "Role-based Dashboards",
      text: "Client and Vendor dashboards with spend, revenue, sold count and KPIs.",
    },
    {
      icon: <HubIcon color="primary" />,
      title: "Integrations-ready",
      text: "CRM/notifications ready (HubSpot/Salesforce, SendGrid/Twilio) with secure APIs.",
    },
    {
      icon: <AutoGraphIcon color="primary" />,
      title: "Analytics",
      text: "Conversion tracking, ROI, and performance metrics for data-driven decisions.",
    },
  ];
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Features
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Everything you need to validate, discover, and purchase high-quality B2B
        leads.
      </Typography>
      <Grid container spacing={3}>
        {cards.map((c, i) => (
          <Grid key={i} item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              {c.icon}
              <Typography variant="h6" mt={1}>
                {c.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {c.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
