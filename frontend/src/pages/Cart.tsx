import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { clearCart, removeItem } from "../features/cart/cartSlice";
import api from "../api/client";
import CheckoutDialog from "./CheckoutDialog";
import { useState } from "react";

export default function Cart() {
  const items = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const total = items.reduce((s, i) => s + i.price, 0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  console.log("Cart items:", items);
  console.log("Cart total:", total);
  console.log("Dialog state:", { open, clientSecret, paymentIntentId });

  const onCheckout = async () => {
    console.log("Starting checkout with items:", items);
    const lead_ids = items.map((i) => i.id);
    console.log("Lead IDs:", lead_ids);

    try {
      const { data } = await api.post("/api/payments/mock-cart-intent", {
        lead_ids,
      });
      console.log("Payment intent response:", data);
      setClientSecret(data.client_secret);
      setPaymentIntentId(data.payment_intent_id);
      setOpen(true);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const onSuccess = async () => {
    if (paymentIntentId) {
      await api.post("/api/payments/mock-cart-confirm", {
        payment_intent_id: paymentIntentId,
      });
    }
    setOpen(false);
    setClientSecret(null);
    setPaymentIntentId(null);
    dispatch(clearCart());
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Your Cart
      </Typography>
      {!items.length && <Typography>No items in cart.</Typography>}
      {!!items.length && (
        <>
          <List>
            {items.map((it) => (
              <ListItem
                key={it.id}
                secondaryAction={
                  <Button
                    color="error"
                    onClick={() => dispatch(removeItem(it.id))}
                  >
                    Remove
                  </Button>
                }
              >
                <ListItemText
                  primary={it.title}
                  secondary={`$${it.price.toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1">
              Total: ${total.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              onClick={onCheckout}
              disabled={!items.length}
            >
              Checkout
            </Button>
          </Stack>
        </>
      )}
      <CheckoutDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onSuccess}
        isCartCheckout={true}
        cartTotal={total}
        paymentIntentId={paymentIntentId}
      />
    </Box>
  );
}
