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
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Search as SearchIcon,
  ViewList,
  ViewModule,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { AuctionItem, PaginatedResponse } from '../../types/api';
import { AuctionStatus } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuctionListPage: React.FC = () => {
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

  if (loading) {
    return <LoadingSpinner message="Loading auctions..." />;
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Browse Auctions
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                fullWidth
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* View Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1" color="text.secondary">
          {auctions?.totalElements || 0} auctions found
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Auctions Grid/List */}
      {auctions && auctions.content.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {auctions.content.map((auction) => (
              <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={auction.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
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
                      height={viewMode === 'list' ? 200 : 200}
                      image={auction.imageUrls[0]}
                      alt={auction.title}
                      sx={{
                        width: viewMode === 'list' ? 300 : '100%',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
                      {auction.description.substring(0, viewMode === 'list' ? 200 : 100)}...
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                      <Box>
                        <Typography variant="h6" color="primary.main">
                          {formatPrice(auction.currentPrice)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {auction.totalBids} bids
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {getTimeRemaining(auction.endDate)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth={viewMode === 'grid'}
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

          {/* Pagination */}
          {auctions.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={auctions.totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
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
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default AuctionListPage;
