import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  ThemeProvider,
  createTheme,
  alpha,
  Snackbar,
  IconButton
} from "@mui/material";
import {
  Send as SendIcon,
  BarChart as BarChartIcon,
  NetworkCheck as NetworkCheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  SaveAlt as SaveAltIcon
} from "@mui/icons-material";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f7ff",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

const App = () => {
  const [jobDesc, setJobDesc] = useState("");
  const [vector, setVector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSubmit = async () => {
    if (!jobDesc.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a job description first",
        severity: "warning"
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post("http://localhost:5000/api/relevance", {
        jobDescription: jobDesc,
      });
      
      console.log("Response data:", res.data);
      
      // Process response data
      let parsedVector;
      if (typeof res.data === 'string') {
        try {
          parsedVector = JSON.parse(res.data);
        } catch (parseErr) {
          console.error("Failed to parse response as JSON:", parseErr);
          setError("Invalid response format from server");
          setVector(null);
          return;
        }
      } else {
        parsedVector = res.data;
      }
      
      // Validate that it's an object with number values
      if (typeof parsedVector !== 'object' || parsedVector === null) {
        setError("Invalid response format from server");
        setVector(null);
        return;
      }
      
      setVector(parsedVector);
      setSnackbar({
        open: true,
        message: "Analysis completed successfully!",
        severity: "success"
      });
    } catch (err) {
      console.error("API request error:", err);
      setError("Failed to fetch relevance vector");
      setVector(null);
      setSnackbar({
        open: true,
        message: "Failed to complete analysis. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJobDesc("");
    setVector(null);
    setError(null);
  };

  const handleExport = () => {
    if (!vector) return;
    
    const dataStr = JSON.stringify(vector, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = "club_relevance_vector.json";
    
    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    setSnackbar({
      open: true,
      message: "Exported data successfully!",
      severity: "success"
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 8) return theme.palette.success.main;
    if (score >= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Calculate average score for network analysis stats
  const calculateAverageScore = () => {
    if (!vector) return 0;
    const scores = Object.values(vector);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Get count of high relevance clubs (score >= 7)
  const getHighRelevanceCount = () => {
    if (!vector) return 0;
    return Object.values(vector).filter(score => score >= 7).length;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <NetworkCheckIcon sx={{ fontSize: 38, color: "primary.main", mr: 2 }} />
              <Typography variant="h4" color="primary.main" gutterBottom>
                Network-Based Campus Ambassador Selector
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Enter the job description for an ambassador role, and our AI agent will analyze it and assign 
              importance scores to various student clubs based on their relevance for network analysis.
            </Typography>
            
            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: "#fff" }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Type or paste the job description here..."
                label="Job Description"
              />
              
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ px: 4, py: 1 }}
                >
                  {loading ? "Analyzing..." : "Get Relevance Vector"}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClear}
                  startIcon={<DeleteIcon />}
                >
                  Clear
                </Button>
                
                {vector && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleExport}
                    startIcon={<SaveAltIcon />}
                  >
                    Export Data
                  </Button>
                )}
              </Box>
            </Paper>
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            
            {vector && (
              <Box mt={4}>
                <Grid container spacing={4}>
                  {/* Stats Cards */}
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              Average Relevance
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {calculateAverageScore().toFixed(1)}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateAverageScore() * 10} 
                              sx={{ mt: 2, height: 8, borderRadius: 4 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              High Relevance Clubs
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {getHighRelevanceCount()}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                              <Chip 
                                label="Network Hubs" 
                                size="small" 
                                color="success" 
                                sx={{ mr: 1 }} 
                              />
                              <Typography variant="body2" color="text.secondary">
                                Clubs with score ≥ 7
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              Total Analyzed
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {Object.keys(vector).length}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                              <Chip 
                                label="Network Nodes" 
                                size="small" 
                                color="primary" 
                                sx={{ mr: 1 }} 
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Score Results */}
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
                        <Typography variant="h6">
                          Club Relevance Scores
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        {Object.entries(vector)
                          .sort((a, b) => b[1] - a[1])
                          .map(([club, score]) => (
                            <Grid item xs={12} sm={6} md={4} key={club}>
                              <Card variant="outlined" sx={{ 
                                borderLeft: `4px solid ${getScoreColor(score)}`,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": {
                                  transform: "translateY(-3px)",
                                  boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
                                }
                              }}>
                                <CardContent sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" noWrap title={club}>
                                    {club}
                                  </Typography>
                                  
                                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={score * 10}
                                        sx={{
                                          height: 8,
                                          borderRadius: 4,
                                          bgcolor: alpha(getScoreColor(score), 0.2),
                                          "& .MuiLinearProgress-bar": {
                                            bgcolor: getScoreColor(score)
                                          }
                                        }}
                                      />
                                    </Box>
                                    <Typography
                                      variant="h6"
                                      sx={{ 
                                        color: getScoreColor(score),
                                        fontWeight: "bold",
                                        minWidth: "30px"
                                      }}
                                    >
                                      {score}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;