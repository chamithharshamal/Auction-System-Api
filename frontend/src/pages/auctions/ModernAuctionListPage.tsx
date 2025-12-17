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
  Slider,
  Drawer,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
  type SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewList,
  ViewModule,
  FilterAlt,
  Favorite,
  FavoriteBorder,
  Close,
  RestartAlt
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { AuctionItem, PaginatedResponse } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import { watchlistService } from '../../services/watchlistService';
import { useAuth } from '../../contexts/AuthContext';

const ModernAuctionListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Data State
  const [auctions, setAuctions] = useState<PaginatedResponse<AuctionItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || '');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc'
  );

  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const categories = [
    'Electronics', 'Art & Collectibles', 'Jewelry', 'Vehicles',
    'Real Estate', 'Sports & Recreation', 'Books & Media',
    'Fashion', 'Home & Garden', 'Other'
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ENDED', label: 'Ended' },
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'endDate-asc', label: 'Ending Soon' },
    { value: 'currentPrice-asc', label: 'Price: Low to High' },
    { value: 'currentPrice-desc', label: 'Price: High to Low' },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadAuctions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, sortBy, sortDir, selectedCategory, selectedStatus, searchQuery, priceRange]);

  useEffect(() => {
    if (user) loadWatchlist();
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
    if (!user) return;

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
      const data = await auctionService.filterAuctions({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        minPrice: priceRange[0],
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        page,
        size: 12,
        sortBy,
        sortDir
      });
      setAuctions(data);
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadAuctions();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setPriceRange([0, 10000]);
    setPage(0);
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    const [field, dir] = value.split('-');
    setSortBy(field);
    setSortDir(dir as 'asc' | 'desc');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'ENDED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'warning';
    }
  };

  const FilterContent = () => (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>Filters</Typography>
        <Button startIcon={<RestartAlt />} onClick={handleClearFilters} size="small">
          Reset
        </Button>
      </Box>

      <Stack spacing={3}>
        {/* Search */}
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />
          }}
        />

        <Divider />

        {/* Category */}
        <FormControl fullWidth size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />

        {/* Status */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>Status</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedStatus}
              displayEmpty
              onChange={(e) => setSelectedStatus(e.target.value)}
              renderValue={(selected) => {
                if (selected === '') {
                  return <em>All Status</em>;
                }
                return selected;
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Price Range */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={(_e, newValue) => setPriceRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            step={100}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption">${priceRange[0]}</Typography>
            <Typography variant="caption">${priceRange[1]}</Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <Box mb={2}>
          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={() => setMobileOpen(true)}
            fullWidth
          >
            Filters
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Sidebar (Desktop) */}
        {!isMobile && (
          <Grid size={{ md: 3, lg: 2.5 }}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                position: 'sticky',
                top: 80
              }}
            >
              <FilterContent />
            </Paper>
          </Grid>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: 280, p: 2 } }}
        >
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </Box>
          <FilterContent />
        </Drawer>

        {/* Main Content */}
        <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
          {/* Header Controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Typography variant="h4" fontWeight={800}>
              {auctions?.totalElements || 0} Auctions
            </Typography>

            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="sort-select-label">Sort</InputLabel>
                <Select
                  labelId="sort-select-label"
                  value={`${sortBy}-${sortDir}`}
                  label="Sort"
                  onChange={handleSortChange}
                  variant="outlined"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid"><ViewModule /></ToggleButton>
                <ToggleButton value="list"><ViewList /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Listings */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Grid size={{ xs: 12, sm: viewMode === 'list' ? 12 : 6, lg: viewMode === 'list' ? 12 : 4 }} key={n}>
                  <Skeleton variant="rounded" height={300} />
                </Grid>
              ))}
            </Grid>
          ) : auctions && auctions.content.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {auctions.content.map((auction) => (
                  <Grid size={{ xs: 12, sm: viewMode === 'list' ? 12 : 6, lg: viewMode === 'list' ? 12 : 4 }} key={auction.id}>
                    <Card
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        borderRadius: 3,
                        display: viewMode === 'list' ? 'flex' : 'block',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                      }}
                    >
                      <Box sx={{ position: 'relative', width: viewMode === 'list' ? 250 : '100%' }}>
                        <CardMedia
                          component="img"
                          height={viewMode === 'list' ? '100%' : 220}
                          image={auction.imageUrls?.[0]}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          onClick={(e) => toggleWatchlist(auction.id, e)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'white' }
                          }}
                        >
                          {watchlist.has(auction.id) ? <Favorite color="error" /> : <FavoriteBorder />}
                        </IconButton>
                        <Chip
                          label={auction.status}
                          color={getStatusColor(auction.status) as any}
                          size="small"
                          sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }}
                        />
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
                          {auction.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {auction.description}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" color="text.secondary">Current Price</Typography>
                            <Typography variant="h6" color="primary.main" fontWeight={800}>
                              {formatPrice(auction.currentPrice)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary">Ends In</Typography>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {getTimeRemaining(auction.endDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button fullWidth variant="contained" size="small" sx={{ borderRadius: 2 }}>
                          Bid Now
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {auctions.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={auctions.totalPages}
                    page={page + 1}
                    onChange={(_e, v) => setPage(v - 1)}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={10}>
              <Typography variant="h5" color="text.secondary" gutterBottom>No auctions found</Typography>
              <Button variant="outlined" onClick={handleClearFilters}>Clear Filters</Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ModernAuctionListPage;