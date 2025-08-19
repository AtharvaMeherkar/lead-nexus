import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 6, py: 3, backgroundColor: "#f5f7fb" }}>
      <Container>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Group D7, Vishwakarma University. All
            rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Lead-Nexus
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
