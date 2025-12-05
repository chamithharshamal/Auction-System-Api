import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Paper,
  InputBase,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Search as SearchIcon,
  Gavel,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { AuctionItem } from '../types/api';
import { AuctionStatus } from '../types/api';
import { auctionService } from '../services/auctionService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredAuctions, setFeaturedAuctions] = useState<AuctionItem[]>([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState<AuctionItem[]>([]);
  const [topAuctions, setTopAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
    const loadData = async () => {
      try {
        setLoading(true);
        const [featured, endingSoon, top] = await Promise.all([
          auctionService.getRecentAuctions(6).catch(err => {
            console.warn('Failed to load recent auctions:', err);
            return [];
          }),
          auctionService.getAuctionsEndingSoon().catch(err => {
            console.warn('Failed to load ending soon auctions:', err);
            return [];
          }),
          auctionService.getTopAuctionsByPrice(4).catch(err => {
            console.warn('Failed to load top auctions:', err);
            return [];
          }),
        ]);
        setFeaturedAuctions(featured);
        setEndingSoonAuctions(endingSoon);
        setTopAuctions(top);
      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/auctions?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusColor = (status: AuctionStatus) => {
    switch (status) {
      case AuctionStatus.ACTIVE:
        return 'success';
      case AuctionStatus.ENDED:
        return 'default';
      case AuctionStatus.CANCELLED:
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading featured auctions..." />;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2d4a69 100%)',
          color: 'white',
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Discover Amazing
                <Box component="span" sx={{ color: 'accent.main' }}>
                  {' '}Auctions
                </Box>
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Find unique items, place bids, and win the perfect auction for you.
              </Typography>

              {/* Search Section */}
              <Paper
                component="form"
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <InputBase
                  placeholder="Search auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, color: 'white' }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    displayEmpty
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton type="submit" sx={{ color: 'white' }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                }}
              >
                <Gavel sx={{ fontSize: 200, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Featured Auctions */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
            Featured Auctions
          </Typography>
          <Grid container spacing={3}>
            {featuredAuctions.map((auction) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={auction.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => navigate(`/auctions/${auction.id}`)}
                >
                  {auction.imageUrls && auction.imageUrls.length > 0 && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={auction.imageUrls[0]}
                      alt={auction.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="h3" noWrap>
                        {auction.title}
                      </Typography>
                      <Chip
                        label={auction.status}
                        color={getStatusColor(auction.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {auction.description.substring(0, 100)}...
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="primary.main">
                        {formatPrice(auction.currentPrice)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getTimeRemaining(auction.endDate)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auctions/${auction.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Ending Soon */}
        {endingSoonAuctions.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
              <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
              Ending Soon
            </Typography>
            <Grid container spacing={3}>
              {endingSoonAuctions.slice(0, 4).map((auction) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={auction.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  >
                    {auction.imageUrls && auction.imageUrls.length > 0 && (
                      <CardMedia
                        component="img"
                        height="150"
                        image={auction.imageUrls[0]}
                        alt={auction.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {auction.title}
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        {formatPrice(auction.currentPrice)}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {getTimeRemaining(auction.endDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Top Auctions */}
        {topAuctions.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Top Auctions
            </Typography>
            <Grid container spacing={3}>
              {topAuctions.map((auction) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={auction.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  >
                    {auction.imageUrls && auction.imageUrls.length > 0 && (
                      <CardMedia
                        component="img"
                        height="150"
                        image={auction.imageUrls[0]}
                        alt={auction.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {auction.title}
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatPrice(auction.currentPrice)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {auction.totalBids} bids
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Start Bidding?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Join thousands of users finding amazing deals every day
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/auctions')}
            sx={{ mr: 2 }}
          >
            Browse All Auctions
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
          >
            Sign Up Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
