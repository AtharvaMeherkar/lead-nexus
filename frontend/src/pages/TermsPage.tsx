import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function TermsPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Terms of Use
      </Typography>
      <Typography color="text.secondary" paragraph>
        Lead‑Nexus is a B2B platform for listing, discovering, and purchasing
        business leads. By using this application you agree to follow all
        applicable laws and to avoid uploading content that violates privacy,
        intellectual property, or data‑protection regulations. The platform
        provides tools for validation, scoring, and purchase; users are
        responsible for the lawful sourcing and consent of any data they upload.
      </Typography>

      <Typography variant="h6" mt={3} gutterBottom>
        Acceptable Use
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Do not upload personal data without proper consent and legal basis." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Do not attempt to bypass security controls or misuse API endpoints." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Use purchased leads in compliance with GDPR/CCPA and local regulations." />
        </ListItem>
      </List>

      <Typography variant="h6" mt={3} gutterBottom>
        Project Mentorship
      </Typography>
      <Typography paragraph>
        Internal Guide: <strong>Prof. Aarti Bhargav Patel</strong>
      </Typography>
      <Typography color="text.secondary" paragraph>
        Prof. Patel provides academic supervision and domain guidance for
        Lead‑Nexus, ensuring the project adheres to best practices in software
        engineering, ethics, and data compliance. Mentorship includes:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Architectural and design reviews for quality and maintainability." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Oversight of security, privacy, and regulatory alignment (GDPR/CCPA)." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Evaluation of deliverables, documentation, and release readiness." />
        </ListItem>
      </List>

      <Typography variant="h6" mt={3} gutterBottom>
        Disclaimer
      </Typography>
      <Typography color="text.secondary" paragraph>
        This is an academic project. While care has been taken to implement
        secure and reliable features, the software is provided “as is” without
        warranties. Production use requires a professional review, proper cloud
        hardening, and legal counsel regarding data protection.
      </Typography>
    </Container>
  );
}
