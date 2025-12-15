import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add,
  Delete,
  Gavel,
  NavigateNext,
  NavigateBefore,
  Image as ImageIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateAuctionRequest } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import ErrorAlert from '../../components/common/ErrorAlert';

const steps = ['Details', 'Pricing', 'Schedule', 'Images'];

const CreateAuctionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CreateAuctionRequest>({
    title: '',
    description: '',
    category: '',
    imageUrls: [],
    startingPrice: 0,
    reservePrice: 0,
    startDate: '',
    endDate: '',
    sellerId: user?.id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const categories = [
    'Electronics',
    'Art & Collectibles',
    'Jewelry',
    'Vehicles',
    'Real Estate',
    'Sports & Recreation',
    'Books & Media',
    'Fashion',
    'Home & Garden',
    'Other',
  ];


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'startingPrice' || name === 'reservePrice'
        ? parseFloat(value) || 0
        : value,
    }));
    // Clear error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (name: string, value: Date | null) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        [name]: value.toISOString(),
      }));
    }
  };

  const handleImageUrlAdd = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ''],
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url),
    }));
  };

  const handleImageUrlRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    switch (step) {
      case 0: // Details
        if (!formData.title.trim()) {
          errors.title = 'Title is required';
        } else if (formData.title.length < 3) {
          errors.title = 'Title must be at least 3 characters';
        }

        if (!formData.description.trim()) {
          errors.description = 'Description is required';
        } else if (formData.description.length < 10) {
          errors.description = 'Description must be at least 10 characters';
        }

        if (!formData.category) errors.category = 'Category is required';
        break;
      case 1: // Pricing
        if (formData.startingPrice <= 0) errors.startingPrice = 'Starting price must be greater than 0';
        if (formData.reservePrice > 0 && formData.reservePrice < formData.startingPrice) {
          errors.reservePrice = 'Reserve price cannot be less than starting price';
        }
        break;
      case 2: // Schedule
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.endDate) errors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          const now = new Date();

          if (start < now) errors.startDate = 'Start date cannot be in the past';
          if (end <= start) errors.endDate = 'End date must be after start date';
        }
        break;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError(null);
    } else {
      setError('Please fill in all required fields correctly before proceeding.');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create an auction');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auctionData = {
        ...formData,
        sellerId: user.id,
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
      };

      await auctionService.createAuction(auctionData);
      setSuccess('Auction created successfully!');
      setTimeout(() => {
        navigate('/my-auctions');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                label="Auction Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title"
                variant="outlined"
                error={!!fieldErrors.title}
                helperText={fieldErrors.title}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={6}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item in detail..."
                variant="outlined"
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.category && (
                  <Typography color="error" variant="caption" sx={{ ml: 2, mt: 0.5 }}>
                    {fieldErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Starting Price"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!fieldErrors.startingPrice}
                helperText={fieldErrors.startingPrice}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Reserve Price (Optional)"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText={fieldErrors.reservePrice || "Minimum price you're willing to accept"}
                error={!!fieldErrors.reservePrice}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label="Start Date & Time"
                value={formData.startDate ? new Date(formData.startDate) : null}
                onChange={(newValue) => handleDateChange('startDate', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!fieldErrors.startDate,
                    helperText: fieldErrors.startDate,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label="End Date & Time"
                value={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(newValue) => handleDateChange('endDate', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!fieldErrors.endDate,
                    helperText: fieldErrors.endDate,
                  },
                }}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add image URLs to showcase your item.
              </Typography>

              {formData.imageUrls.map((url, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, position: 'relative' }}>
                  <CardContent>
                    <TextField
                      fullWidth
                      label={`Image URL ${index + 1}`}
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ImageIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {url && (
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={url}
                          alt="Preview"
                          style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Invalid+URL';
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleImageUrlRemove(index)}
                      aria-label="remove image"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleImageUrlAdd}
                fullWidth
                sx={{ mt: 1, borderStyle: 'dashed' }}
              >
                Add Another Image
              </Button>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 700 }}>
          Create New Auction
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <ErrorAlert
              open={!!error}
              message={error}
              onClose={() => setError(null)}
            />
          )}
          {success && (
            <ErrorAlert
              open={!!success}
              message={success}
              onClose={() => setSuccess(null)}
              severity="success"
            />
          )}

          <Box sx={{ mt: 2, minHeight: 300 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBefore />}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<Gavel />}
                  disabled={loading}
                  size="large"
                  sx={{ px: 4, borderRadius: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Auction'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NavigateNext />}
                  size="large"
                  sx={{ px: 4, borderRadius: 2 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateAuctionPage;