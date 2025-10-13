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
  Grid,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Gavel,
  TrendingUp,
  Schedule,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { AuctionItem } from '../types/api';
import { AuctionStatus } from '../types/api';
import { auctionService } from '../services/auctionService';

const ModernHomePage: React.FC = () => {
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

  return (
    <Box sx={{ backgroundColor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${'#00796b'} 0%, ${'#009688'} 100%)`,
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%)',
            opacity: 0.3,
          }} 
        />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 2,
                }}
              >
                Discover Amazing
                <Box component="span" sx={{ color: '#ff6b6b' }}>
                  {' '}Auctions
                </Box>
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95,
                  fontWeight: 400,
                }}
              >
                Find unique items, place bids, and win the perfect auction for you.
              </Typography>
              
              {/* Search Section */}
              <Paper
                component="form"
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                sx={{
                  p: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 50,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }}
              >
                <InputBase
                  placeholder="Search auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ 
                    flex: 1, 
                    color: '#00796b',
                    pl: 3,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 140, mr: 1 }}>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    displayEmpty
                    sx={{ 
                      color: '#00796b', 
                      fontWeight: 600,
                      '& .MuiSelect-select': {
                        py: 1.5,
                        pl: 2,
                        pr: 3,
                      }
                    }}
                    size="small"
                  >
                    <MenuItem value="" sx={{ fontWeight: 500 }}>All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category} sx={{ fontWeight: 500 }}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    borderRadius: 50,
                    py: 1.5,
                    px: 3,
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                    '&:hover': {
                      backgroundColor: '#ff4848',
                      boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
                    },
                  }}
                >
                  Search
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 250, md: 350 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 200, md: 280 },
                    height: { xs: 200, md: 280 },
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 3s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.3)',
                      },
                      '70%': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
                      },
                    },
                  }}
                >
                  <Gavel sx={{ fontSize: { xs: 100, md: 150 }, color: 'white', opacity: 0.9 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 6 }}>
        {/* Featured Auctions */}
        <Box sx={{ mb: 8 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Featured Auctions
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/auctions')}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 600,
                py: 1,
                px: 3,
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(0, 121, 107, 0.05)',
                  borderWidth: 2,
                },
              }}
            >
              View All
            </Button>
          </Box>
          
          {loading ? (
            <Grid container spacing={4}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {featuredAuctions.map((auction) => (
                <Grid item xs={12} sm={6} md={4} key={auction.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  >
                    {auction.imageUrls && auction.imageUrls.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="220"
                        image={auction.imageUrls[0]}
                        alt={auction.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 220,
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Gavel sx={{ fontSize: 60, color: 'grey.400' }} />
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, py: 2.5, px: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Typography 
                          variant="h5" 
                          component="h3" 
                          noWrap
                          sx={{ 
                            fontWeight: 700,
                            color: 'text.primary',
                          }}
                        >
                          {auction.title}
                        </Typography>
                        <Chip
                          label={auction.status}
                          color={getStatusColor(auction.status) as any}
                          size="small"
                          sx={{ 
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.6,
                        }}
                      >
                        {auction.description.substring(0, 100)}...
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 800,
                              color: 'primary.main',
                            }}
                          >
                            {formatPrice(auction.currentPrice)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {auction.totalBids} bids
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {getTimeRemaining(auction.endDate)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/auctions/${auction.id}`);
                        }}
                        sx={{
                          py: 1.5,
                          fontWeight: 700,
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0, 121, 107, 0.25)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(0, 121, 107, 0.35)',
                          },
                        }}
                      >
                        Place Bid
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Ending Soon */}
        {endingSoonAuctions.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Box display="flex" alignItems="center" mb={4}>
              <Schedule sx={{ fontSize: 36, color: '#ff6b6b', mr: 1.5 }} />
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${'#ff6b6b'}, ${'#ff8e8e'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Ending Soon
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {endingSoonAuctions.slice(0, 4).map((auction) => (
                <Grid item xs={12} sm={6} md={3} key={auction.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  >
                    {auction.imageUrls && auction.imageUrls.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={auction.imageUrls[0]}
                        alt={auction.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 160,
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Gavel sx={{ fontSize: 40, color: 'grey.400' }} />
                      </Box>
                    )}
                    <CardContent sx={{ py: 2, px: 2.5 }}>
                      <Typography 
                        variant="h6" 
                        noWrap
                        sx={{ 
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        {auction.title}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800,
                          color: '#ff6b6b',
                          mb: 0.5,
                        }}
                      >
                        {formatPrice(auction.currentPrice)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#ff6b6b',
                          fontWeight: 600,
                        }}
                      >
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
          <Box sx={{ mb: 8 }}>
            <Box display="flex" alignItems="center" mb={4}>
              <TrendingUp sx={{ fontSize: 36, color: '#00796b', mr: 1.5 }} />
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Top Auctions
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {topAuctions.map((auction) => (
                <Grid item xs={12} sm={6} md={3} key={auction.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                  >
                    {auction.imageUrls && auction.imageUrls.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={auction.imageUrls[0]}
                        alt={auction.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 160,
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Gavel sx={{ fontSize: 40, color: 'grey.400' }} />
                      </Box>
                    )}
                    <CardContent sx={{ py: 2, px: 2.5 }}>
                      <Typography 
                        variant="h6" 
                        noWrap
                        sx={{ 
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        {auction.title}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800,
                          color: 'primary.main',
                          mb: 0.5,
                        }}
                      >
                        {formatPrice(auction.currentPrice)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
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
            py: 8,
            backgroundColor: 'white',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(0, 121, 107, 0.05) 0%, transparent 15%)',
            }} 
          />
          <Container maxWidth="sm">
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ready to Start Bidding?
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontWeight: 400,
              }}
            >
              Join thousands of users finding amazing deals every day
            </Typography>
            <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auctions')}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: '0 6px 16px rgba(0, 121, 107, 0.3)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: '0 8px 24px rgba(0, 121, 107, 0.4)',
                  },
                }}
              >
                Browse All Auctions
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(0, 121, 107, 0.05)',
                    borderWidth: 2,
                  },
                }}
              >
                Sign Up Now
              </Button>
            </Box>
          </Container>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHomePage;