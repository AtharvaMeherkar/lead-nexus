/**
 * CheckoutDialog Component
 *
 * Simplified mock payment interface without Stripe integration.
 * Provides a realistic payment form for demonstration purposes.
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Divider,
  Alert,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { CreditCard, Lock, CheckCircle, Security } from "@mui/icons-material";
import api from "../api/client";

interface BillingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientSecret?: string | null;
  leadId?: number;
  cartTotal?: number;
  isCartCheckout?: boolean;
  paymentIntentId?: string | null;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  onSuccess,
  clientSecret,
  leadId,
  cartTotal,
  isCartCheckout = false,
  paymentIntentId,
}) => {
  // Form state
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // UI state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  /**
   * Handle billing address field changes
   */
  const handleAddressChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle card details field changes with formatting
   */
  const handleCardChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (field === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .substring(0, 19); // Max 16 digits + 3 spaces
    }

    // Format expiry date (MM/YY)
    if (field === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .substring(0, 5);
    }

    // Format CVV (3-4 digits only)
    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): string | null => {
    // Billing address validation
    const requiredFields: (keyof BillingAddress)[] = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
    ];

    for (const field of requiredFields) {
      if (!billingAddress[field].trim()) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingAddress.email)) {
      return "Please enter a valid email address";
    }

    // Card validation
    if (!cardDetails.cardholderName.trim()) {
      return "Cardholder name is required";
    }

    if (cardDetails.cardNumber.replace(/\s/g, "").length < 13) {
      return "Please enter a valid card number";
    }

    if (cardDetails.expiryDate.length !== 5) {
      return "Please enter a valid expiry date (MM/YY)";
    }

    if (cardDetails.cvv.length < 3) {
      return "Please enter a valid CVV";
    }

    return null;
  };

  /**
   * Handle payment processing
   */
  const handlePayment = async () => {
    setError("");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    try {
      let response;

      if (isCartCheckout) {
        // Cart checkout flow - payment intent already created by Cart component
        // Just confirm the payment using the existing clientSecret

        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Confirm payment using the paymentIntentId from Cart component
        response = await api.post("/api/payments/mock-cart-confirm", {
          payment_intent_id: paymentIntentId,
        });
      } else {
        // Single lead checkout flow - payment intent already created by parent component
        if (!clientSecret) {
          throw new Error("Client secret is required");
        }

        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Confirm payment using the clientSecret
        response = await api.post("/api/payments/webhook", {
          payment_intent_id: clientSecret?.replace("cs_test_mock_", "pi_mock_"),
        });
      }

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.error || "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Reset form and close dialog
   */
  const handleClose = () => {
    setBillingAddress({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    });
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
    setError("");
    setSuccess(false);
    setProcessing(false);
    onClose();
  };

  if (success) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography color="text.secondary">
            {isCartCheckout
              ? "Your leads have been purchased and added to your account."
              : "Your lead has been purchased successfully."}
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCard />
          <Typography variant="h6">Complete Your Purchase</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Order Summary */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>
                  {isCartCheckout ? "Cart Total" : "Lead Purchase"}
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{isCartCheckout ? cartTotal?.toFixed(2) : "Loading..."}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Billing Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={billingAddress.firstName}
                  onChange={(e) =>
                    handleAddressChange("firstName", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={billingAddress.lastName}
                  onChange={(e) =>
                    handleAddressChange("lastName", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={billingAddress.email}
                  onChange={(e) => handleAddressChange("email", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={billingAddress.phone}
                  onChange={(e) => handleAddressChange("phone", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={billingAddress.address}
                  onChange={(e) =>
                    handleAddressChange("address", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={billingAddress.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={billingAddress.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={billingAddress.zipCode}
                  onChange={(e) =>
                    handleAddressChange("zipCode", e.target.value)
                  }
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Payment Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardDetails.cardholderName}
                  onChange={(e) =>
                    handleCardChange("cardholderName", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    handleCardChange("cardNumber", e.target.value)
                  }
                  placeholder="1234 5678 9012 3456"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={cardDetails.expiryDate}
                  onChange={(e) =>
                    handleCardChange("expiryDate", e.target.value)
                  }
                  placeholder="MM/YY"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardChange("cvv", e.target.value)}
                  placeholder="123"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          {/* Security Notice */}
          <Alert severity="info" icon={<Security />}>
            <Typography variant="body2">
              This is a demo payment system. No real transactions will be
              processed. Your information is safe and will not be stored.
            </Typography>
          </Alert>

          {/* Error Display */}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
          sx={{ minWidth: 140 }}
        >
          {processing ? "Processing..." : "Pay Now"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;
