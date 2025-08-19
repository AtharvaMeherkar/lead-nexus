import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
} from "@mui/material";
import { useState } from "react";
import { ExpandMore, ExpandLess, CloudUpload, CheckCircle, Error } from "@mui/icons-material";
import api from "../api/client";

interface ParsedLead {
  title: string;
  industry: string;
  price: number;
  contact_email?: string;
  extra: Record<string, any>;
}

interface SkippedLead {
  row_number: number;
  data: Record<string, any>;
  reason: string;
}

interface UploadResponse {
  parsed_leads: ParsedLead[];
  skipped: SkippedLead[];
  total_parsed: number;
  total_skipped: number;
  requires_pricing: boolean;
}

export default function VendorUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showSkipped, setShowSkipped] = useState(false);
  const [editedLeads, setEditedLeads] = useState<ParsedLead[]>([]);

  const onFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/api/leads/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setUploadResponse(data);
      setEditedLeads([...data.parsed_leads]);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmUpload = async () => {
    if (!editedLeads.length) return;

    setConfirming(true);
    setError("");
    
    try {
      const { data } = await api.post("/api/leads/upload/confirm", {
        leads: editedLeads,
      });
      
      setSuccess(`Successfully created ${data.created} leads!`);
      setUploadResponse(null);
      setEditedLeads([]);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to confirm upload");
    } finally {
      setConfirming(false);
    }
  };

  const updateLead = (index: number, field: string, value: any) => {
    const updated = [...editedLeads];
    if (field === "price") {
      updated[index] = { ...updated[index], price: parseFloat(value) || 0 };
    } else if (field.startsWith("extra.")) {
      const extraField = field.replace("extra.", "");
      updated[index] = {
        ...updated[index],
        extra: { ...updated[index].extra, [extraField]: value }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditedLeads(updated);
  };

  const resetUpload = () => {
    setUploadResponse(null);
    setEditedLeads([]);
    setFile(null);
    setError("");
    setSuccess("");
  };

  if (uploadResponse && editedLeads.length > 0) {
    return (
      <Box maxWidth={1200} mx="auto">
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" mb={1}>
                Review and Configure Your Leads
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please review the extracted data and set pricing for each lead before confirming the upload.
              </Typography>
            </Box>

            {/* Summary Cards */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    <CheckCircle sx={{ mr: 1, verticalAlign: "middle" }} />
                    {uploadResponse.total_parsed} Leads Parsed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ready for review and pricing
                  </Typography>
                </CardContent>
              </Card>
              
              {uploadResponse.total_skipped > 0 && (
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" color="warning.main">
                      <Error sx={{ mr: 1, verticalAlign: "middle" }} />
                      {uploadResponse.total_skipped} Leads Skipped
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowSkipped(!showSkipped)}
                      endIcon={showSkipped ? <ExpandLess /> : <ExpandMore />}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Stack>

            {/* Skipped Leads Details */}
            <Collapse in={showSkipped}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" mb={1}>Skipped Leads:</Typography>
                {uploadResponse.skipped.map((skipped, idx) => (
                  <Typography key={idx} variant="body2">
                    Row {skipped.row_number}: {skipped.reason}
                  </Typography>
                ))}
              </Alert>
            </Collapse>

            {/* Leads Review Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Industry</TableCell>
                    <TableCell>Price ($)</TableCell>
                    <TableCell>Contact Email</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Additional Info</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editedLeads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={lead.title}
                          onChange={(e) => updateLead(index, "title", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={lead.industry}
                          onChange={(e) => updateLead(index, "industry", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={lead.price}
                          onChange={(e) => updateLead(index, "price", e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={lead.contact_email || ""}
                          onChange={(e) => updateLead(index, "contact_email", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={lead.extra?.company_name || ""}
                          onChange={(e) => updateLead(index, "extra.company_name", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {Object.entries(lead.extra || {}).map(([key, value]) => (
                            key !== "company_name" && (
                              <Chip
                                key={key}
                                label={`${key}: ${String(value).substring(0, 20)}${String(value).length > 20 ? '...' : ''}`}
                                size="small"
                                variant="outlined"
                              />
                            )
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={resetUpload}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onConfirmUpload}
                disabled={confirming || editedLeads.length === 0}
                startIcon={confirming ? <CircularProgress size={20} /> : <CheckCircle />}
              >
                {confirming ? "Creating Leads..." : `Confirm & Create ${editedLeads.length} Leads`}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" mb={1}>
              Upload Leads
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload your CSV file to extract and configure lead data for the marketplace
            </Typography>
          </Box>

          <Divider />

          {/* Upload Instructions */}
          <Alert severity="info">
            <Typography variant="subtitle2" mb={1}>CSV Format Requirements:</Typography>
            <Typography variant="body2" component="div">
              • Required columns: <strong>title, industry, price</strong><br/>
              • Optional columns: contact_email, company_name, contact_name, phone, location, description<br/>
              • First row should contain column headers<br/>
              • Price should be numeric values only
            </Typography>
          </Alert>

          {/* File Upload Form */}
          <form onSubmit={onFileUpload}>
            <Stack spacing={3}>
              <Box>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                  id="csv-upload-input"
                />
                <label htmlFor="csv-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ py: 3, borderStyle: "dashed" }}
                    startIcon={<CloudUpload />}
                  >
                    {file ? file.name : "Choose CSV File"}
                  </Button>
                </label>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
              >
                {loading ? "Processing..." : "Upload & Parse CSV"}
              </Button>
            </Stack>
          </form>

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
