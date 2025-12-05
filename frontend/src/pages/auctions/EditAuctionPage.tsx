import React, { useState, useEffect } from 'react';
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
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add,
  Delete,
  Gavel,
  ArrowBack,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { AuctionItem, UpdateAuctionRequest } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditAuctionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateAuctionRequest>({
    title: '',
    description: '',
    category: '',
    imageUrls: [''],
    reservePrice: 0,
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (id) {
      loadAuctionDetails();
    }
  }, [id]);

  const loadAuctionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const auctionData = await auctionService.getAuctionById(id!);

      // Check if user is the seller
      if (auctionData.seller.id !== user?.id) {
        setError('You are not authorized to edit this auction');
        return;
      }

      setAuction(auctionData);

      // Initialize form data with auction details
      setFormData({
        title: auctionData.title,
        description: auctionData.description,
        category: auctionData.category,
        imageUrls: auctionData.imageUrls.length > 0 ? [...auctionData.imageUrls] : [''],
        reservePrice: auctionData.reservePrice,
        startDate: auctionData.startDate,
        endDate: auctionData.endDate,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reservePrice'
        ? parseFloat(value) || 0
        : value,
    }));
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
    if (formData.imageUrls.length > 1) {
      setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !auction) {
      setError('You must be logged in to edit an auction');
      return;
    }

    // Validate form
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.reservePrice > 0 && formData.reservePrice < auction.startingPrice) {
      setError('Reserve price must be greater than or equal to starting price');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const auctionData = {
        ...formData,
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
      };

      await auctionService.updateAuction(auction.id, auctionData);
      setSuccess('Auction updated successfully!');
      setTimeout(() => {
        navigate(`/auctions/${auction.id}`);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update auction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading auction details..." />;
  }

  if (!auction) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Auction not found</Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Auction
        </Typography>

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

        <Paper sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Auction Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title for your auction"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the item in detail. Include condition, features, and any relevant information."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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
                </FormControl>
              </Grid>

              {/* Pricing */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Pricing
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Note: Starting price cannot be changed after auction creation. Only reserve price can be modified.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled
                  fullWidth
                  type="number"
                  label="Starting Price"
                  value={auction.startingPrice}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reserve Price (Optional)"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  helperText="Minimum price you're willing to accept"
                />
              </Grid>

              {/* Dates */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Auction Schedule
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(newValue) => handleDateChange('endDate', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>

              {/* Images */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Images
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add image URLs to showcase your item. You can add multiple images.
                </Typography>

                {formData.imageUrls.map((url, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <TextField
                        fullWidth
                        label={`Image URL ${index + 1}`}
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </CardContent>
                    <CardActions>
                      <IconButton
                        color="error"
                        onClick={() => handleImageUrlRemove(index)}
                        disabled={formData.imageUrls.length <= 1}
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
                  sx={{ mb: 2 }}
                >
                  Add Image URL
                </Button>
              </Grid>

              {/* Submit */}
              <Grid size={{ xs: 12 }}>
                <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Gavel />}
                    disabled={saving}
                    sx={{ minWidth: 150 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default EditAuctionPage;