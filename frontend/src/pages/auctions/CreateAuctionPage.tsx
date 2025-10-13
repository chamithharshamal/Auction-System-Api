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
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add,
  Delete,
  Gavel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { CreateAuctionRequest } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import ErrorAlert from '../../components/common/ErrorAlert';

const CreateAuctionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create an auction');
      return;
    }

    // Validate form
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.startingPrice <= 0) {
      setError('Starting price must be greater than 0');
      return;
    }

    if (formData.reservePrice > 0 && formData.reservePrice < formData.startingPrice) {
      setError('Reserve price must be greater than or equal to starting price');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
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

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Auction
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
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
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

            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Pricing
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
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
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Auction Schedule
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="datetime-local"
                label="Start Date & Time"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="datetime-local"
                label="End Date & Time"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Images
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/my-auctions')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Gavel />}
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Creating...' : 'Create Auction'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAuctionPage;
