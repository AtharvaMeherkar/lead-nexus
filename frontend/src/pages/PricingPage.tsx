import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api/client";

interface PlanProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  actionLabel: string;
  highlight?: boolean;
  planType: "starter" | "professional" | "enterprise";
  onAction: (planType: string) => void;
}

function Plan({
  title,
  price,
  period,
  features,
  actionLabel,
  highlight,
  planType,
  onAction,
}: PlanProps) {
  return (
    <Card
      sx={{
        borderWidth: highlight ? 2 : 1,
        borderStyle: "solid",
        borderColor: highlight ? "primary.main" : "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {highlight && (
          <Typography variant="overline" color="primary">
            Most Popular
          </Typography>
        )}
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="h4" mt={1}>
          {price}
          {period && (
            <Typography component="span" variant="body2">
              /{period}
            </Typography>
          )}
        </Typography>
        <List dense>
          {features.map((f, i) => (
            <ListItem key={i}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={f} />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant={highlight ? "contained" : "outlined"}
          onClick={() => onAction(planType)}
        >
          {actionLabel}
        </Button>
      </CardActions>
    </Card>
  );
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  plan: {
    title: string;
    price: string;
    planType: string;
  } | null;
  isFreeTrial?: boolean;
}

function PaymentDialog({
  open,
  onClose,
  plan,
  isFreeTrial = false,
}: PaymentDialogProps) {
  // Don't render if plan is null
  if (!plan) {
    return null;
  }
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    setError("");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock payment success
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon
            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            {isFreeTrial ? "Free Trial Started!" : "Payment Successful!"}
          </Typography>
                     <Typography color="text.secondary">
             {isFreeTrial
               ? "Your 14-day free trial has been activated. You'll be charged after the trial period."
               : `Welcome to ${plan?.title || 'your plan'}! Your subscription is now active.`}
           </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {isFreeTrial ? "Start Free Trial" : "Complete Payment"}
        </Typography>
                 <Typography variant="body2" color="text.secondary">
           {isFreeTrial
             ? `${plan?.title || 'Professional'} - 14-day free trial, then $${plan?.price || '299'}/month`
             : `${plan?.title || 'Plan'} - $${plan?.price || '99'}`}
         </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            {isFreeTrial
              ? "Start your 14-day free trial. No charges until trial ends."
              : "This is a demo payment system. No real charges will be made."}
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={billingInfo.firstName}
                onChange={(e) =>
                  setBillingInfo((prev) => ({
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
                value={billingInfo.lastName}
                onChange={(e) =>
                  setBillingInfo((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={billingInfo.email}
                onChange={(e) =>
                  setBillingInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={billingInfo.company}
                onChange={(e) =>
                  setBillingInfo((prev) => ({
                    ...prev,
                    company: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={billingInfo.address}
                onChange={(e) =>
                  setBillingInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={billingInfo.city}
                onChange={(e) =>
                  setBillingInfo((prev) => ({ ...prev, city: e.target.value }))
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={billingInfo.state}
                onChange={(e) =>
                  setBillingInfo((prev) => ({ ...prev, state: e.target.value }))
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={billingInfo.zipCode}
                onChange={(e) =>
                  setBillingInfo((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Payment Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                value={cardInfo.cardholderName}
                onChange={(e) =>
                  setCardInfo((prev) => ({
                    ...prev,
                    cardholderName: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                value={cardInfo.cardNumber}
                onChange={(e) =>
                  setCardInfo((prev) => ({
                    ...prev,
                    cardNumber: e.target.value,
                  }))
                }
                placeholder="1234 5678 9012 3456"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                value={cardInfo.expiryDate}
                onChange={(e) =>
                  setCardInfo((prev) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
                placeholder="MM/YY"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CVV"
                value={cardInfo.cvv}
                onChange={(e) =>
                  setCardInfo((prev) => ({ ...prev, cvv: e.target.value }))
                }
                placeholder="123"
                required
              />
            </Grid>
          </Grid>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : null}
        >
          {processing
            ? "Processing..."
            : isFreeTrial
            ? "Start Free Trial"
            : "Complete Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    plan: any;
    isFreeTrial: boolean;
  }>({
    open: false,
    plan: null,
    isFreeTrial: false,
  });

  const handlePlanAction = (planType: string) => {
    if (!token) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    switch (planType) {
      case "starter":
        setPaymentDialog({
          open: true,
          plan: { title: "Starter", price: "99", planType: "starter" },
          isFreeTrial: false,
        });
        break;
      case "professional":
        setPaymentDialog({
          open: true,
          plan: {
            title: "Professional",
            price: "299",
            planType: "professional",
          },
          isFreeTrial: true,
        });
        break;
      case "enterprise":
        navigate("/contact-sales");
        break;
    }
  };

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700}>
        Pricing
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Simple, Transparent Pricing. Choose the plan that best fits your
        business needs. All plans include access to core features.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Plan
            title="Starter"
            price="$99"
            period="month"
            actionLabel="Get Started"
            planType="starter"
            onAction={handlePlanAction}
            features={[
              "Access to marketplace",
              "Up to 100 leads/month",
              "Basic lead filtering",
              "Email support",
              "Standard validation",
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Plan
            title="Professional"
            price="$299"
            period="month"
            actionLabel="Start Free Trial"
            highlight
            planType="professional"
            onAction={handlePlanAction}
            features={[
              "Everything in Starter",
              "Up to 500 leads/month",
              "Advanced lead filtering",
              "AI lead scoring",
              "Real-time collaboration",
              "Priority support",
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Plan
            title="Enterprise"
            price="Custom"
            actionLabel="Contact Sales"
            planType="enterprise"
            onAction={handlePlanAction}
            features={[
              "Everything in Professional",
              "Unlimited leads",
              "Custom AI models",
              "API access",
              "Dedicated account manager",
              "SLA guarantees",
              "Custom integrations",
            ]}
          />
        </Grid>
      </Grid>

      <PaymentDialog
        open={paymentDialog.open}
        onClose={() =>
          setPaymentDialog({ open: false, plan: null, isFreeTrial: false })
        }
        plan={paymentDialog.plan}
        isFreeTrial={paymentDialog.isFreeTrial}
      />
    </Container>
  );
}
