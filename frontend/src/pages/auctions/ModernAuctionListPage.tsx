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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewList,
  ViewModule,
  FilterAlt,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { AuctionItem, PaginatedResponse } from '../../types/api';
import { AuctionStatus } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import { watchlistService } from '../../services/watchlistService';
import { useAuth } from '../../contexts/AuthContext';

const ModernAuctionListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<PaginatedResponse<AuctionItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir] = useState<'asc' | 'desc'>(
    (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

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

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ENDED', label: 'Ended' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'endDate', label: 'Ending Soon' },
    { value: 'currentPrice', label: 'Price: Low to High' },
    { value: 'currentPrice', label: 'Price: High to Low' },
  ];

  useEffect(() => {
    loadAuctions();
  }, [page, sortBy, sortDir, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    try {
      const items = await watchlistService.getWatchlist();
      setWatchlist(new Set(items.map(item => item.id)));
    } catch (error) {
      console.error('Error loading watchlist', error);
    }
  };

  const toggleWatchlist = async (auctionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Redirect to login or show message
      return;
    }

    const isWatched = watchlist.has(auctionId);
    try {
      if (isWatched) {
        await watchlistService.removeFromWatchlist(auctionId);
        setWatchlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(auctionId);
          return newSet;
        });
      } else {
        await watchlistService.addToWatchlist(auctionId);
        setWatchlist(prev => new Set(prev).add(auctionId));
      }
    } catch (error) {
      console.error('Error toggling watchlist', error);
    }
  };

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAllAuctions(page, 12, sortBy, sortDir);
      setAuctions(data);
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedStatus) params.append('status', selectedStatus);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    params.append('page', '0');
    setSearchParams(params);
    setPage(0);
    loadAuctions();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
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
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Browse Auctions
        </Typography>
        <IconButton
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            backgroundColor: showFilters ? 'primary.main' : 'grey.200',
            color: showFilters ? 'white' : 'text.primary',
            borderRadius: 3,
            p: 1.5,
            '&:hover': {
              backgroundColor: showFilters ? 'primary.dark' : 'grey.300',
            },
          }}
        >
          <FilterAlt />
        </IconButton>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {sortOptions.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                fullWidth
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
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* View Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {auctions?.totalElements || 0} auctions found
        </Typography>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              height: 40,
              '& .MuiToggleButton-root': {
                borderRadius: 2,
                borderColor: 'primary.main',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              },
            }}
          >
            <ToggleButton value="grid">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Auctions Grid/List */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: viewMode === 'grid' ? 4 : 12 }} key={item}>
              <Skeleton variant="rounded" height={viewMode === 'grid' ? 400 : 200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : auctions && auctions.content.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {auctions.content.map((auction) => (
              <Grid size={{ xs: 12, sm: 6, md: viewMode === 'grid' ? 4 : 12 }} key={auction.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
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
                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 100 }}>
                    <IconButton
                      onClick={(e) => toggleWatchlist(auction.id, e)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                    >
                      {watchlist.has(auction.id) ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
                  {auction.imageUrls && auction.imageUrls.length > 0 && (
                    <CardMedia
                      component="img"
                      height={viewMode === 'list' ? 200 : 200}
                      image={auction.imageUrls[0]}
                      alt={auction.title}
                      sx={{
                        width: viewMode === 'list' ? 300 : '100%',
                        flexShrink: 0,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 2.5, px: 3 }}>
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
                      {auction.description.substring(0, viewMode === 'list' ? 200 : 100)}...
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
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
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth={viewMode === 'grid'}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auctions/${auction.id}`);
                      }}
                      sx={{
                        py: 1.2,
                        fontWeight: 700,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 121, 107, 0.25)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(0, 121, 107, 0.35)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {auctions.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={6}>
              <Pagination
                count={auctions.totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 600,
                    borderRadius: 2,
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={12}>
          <Typography
            variant="h4"
            color="text.secondary"
            sx={{ mb: 3, fontWeight: 500 }}
          >
            No auctions found matching your criteria.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedStatus('');
              setPage(0);
              loadAuctions();
            }}
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 121, 107, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 121, 107, 0.35)',
              },
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ModernAuctionListPage;