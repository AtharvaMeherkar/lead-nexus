import {
  Avatar,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Member {
  name: string;
  role: string;
  bio: string;
  advantages: string[];
}

const members: Member[] = [
  {
    name: "Atharva Meherkar",
    role: "Frontend Lead (React)",
    bio: "Leads UI development to deliver a modern, responsive, and intuitive experience for all roles.",
    advantages: [
      "Owns React-based dashboards and user-facing features",
      "Optimizes performance and UX for fast, fluid navigation",
      "Implements component library and design system consistency",
    ],
  },
  {
    name: "Akash Mirande",
    role: "Backend Developer (Node.js)",
    bio: "Builds scalable APIs and services with robust data and third‑party integrations.",
    advantages: [
      "Designs Node.js services and efficient PostgreSQL access",
      "Integrates external APIs and third-party services",
      "Ensures throughput and reliability for analytics pipelines",
    ],
  },
  {
    name: "Usman Khan",
    role: "AI/ML Specialist",
    bio: "Delivers ML capabilities for predictive scoring, matching and sentiment analysis.",
    advantages: [
      "Develops predictive lead scoring with high accuracy",
      "Implements smart matching and NLP sentiment workflows",
      "Builds evaluation loops to reach the 95% accuracy target",
    ],
  },
  {
    name: "Yash Joshi",
    role: "DevOps & Cloud Lead",
    bio: "Owns cloud infrastructure, CI/CD and platform reliability.",
    advantages: [
      "Automates build and deploy pipelines to cloud",
      "Implements HA/monitoring for uptime and resilience",
      "Manages secure secrets/config across environments",
    ],
  },
  {
    name: "Vedant Telgar",
    role: "QA & Security Lead",
    bio: "Drives quality, security and compliance across the stack.",
    advantages: [
      "Establishes comprehensive automated testing strategy",
      "Implements encryption and secure authentication controls",
      "Verifies GDPR/CCPA and PCI-DSS compliance posture",
    ],
  },
];

export default function TeamPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Lead‑Nexus Official Project Team
      </Typography>
      <Typography color="text.secondary" mb={4}>
        The multidisciplinary team powering engineering, AI and operations.
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="primary">
            Internal Guide
          </Typography>
          <Typography variant="h6">Prof. Aarti Bhargav Patel</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5} mb={1}>
            Academic mentor providing supervision and domain guidance across
            software engineering, ethics, and data compliance to ensure
            high‑quality outcomes.
          </Typography>
          <Typography variant="subtitle2">Mentorship Focus</Typography>
          <List dense>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Architecture/design reviews for quality and maintainability" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Security, privacy, and regulatory alignment (GDPR/CCPA)" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Evaluation of deliverables, documentation, and release readiness" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        {members.map((m, i) => (
          <Grid key={i} item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ width: 56, height: 56, mb: 1 }}>
                  {m.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{m.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {m.role}
                </Typography>
                <Typography variant="body2" mt={1} mb={1}>
                  {m.bio}
                </Typography>
                <Typography variant="subtitle2">Key Advantages</Typography>
                <List dense>
                  {m.advantages.map((a, idx) => (
                    <ListItem key={idx} disableGutters>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={a} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
