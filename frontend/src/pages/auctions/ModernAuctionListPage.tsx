import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Pagination,
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
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const FilterContent = () => (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Filters</Typography>
        <IconButton onClick={handleClearFilters} size="small" sx={{ color: 'primary.main' }}>
          <RestartAlt />
        </IconButton>
      </Box>

      <Stack spacing={4}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>
            Search
          </Typography>
          <TextField
            fullWidth
            placeholder="What are you looking for?"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)',
              }
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 2, display: 'block' }}>
            Category
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '12px', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)' }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 2, display: 'block' }}>
            Auction Status
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedStatus}
              displayEmpty
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={{ borderRadius: '12px', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)' }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 2, display: 'block' }}>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={(_e, newValue) => setPriceRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={10000}
            step={100}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
                backgroundColor: '#fff',
                border: '3px solid currentColor',
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>${priceRange[0]}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>${priceRange[1]}+</Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 10 } }} className="page-fade-in">
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          {/* Sidebar */}
          {!isMobile && (
            <Grid size={{ md: 3, lg: 2.5 }}>
              <Paper
                className="glass-panel"
                sx={{
                  position: 'sticky',
                  top: 100,
                  overflow: 'hidden',
                }}
              >
                <FilterContent />
              </Paper>
            </Grid>
          )}

          {/* Main List */}
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            {/* Action Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  Marketplace
                </Typography>
                <Typography color="text.secondary">
                  Showing {auctions?.totalElements || 0} items
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={`${sortBy}-${sortDir}`}
                    onChange={handleSortChange}
                    sx={{ borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)' }}
                  >
                    {sortOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_e, newMode) => newMode && setViewMode(newMode)}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    '& .MuiToggleButton-root': { border: 'none', px: 2 }
                  }}
                >
                  <ToggleButton value="grid"><ViewModule /></ToggleButton>
                  <ToggleButton value="list"><ViewList /></ToggleButton>
                </ToggleButtonGroup>

                {isMobile && (
                  <IconButton onClick={() => setMobileOpen(true)} sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)' }}>
                    <FilterAlt />
                  </IconButton>
                )}
              </Box>
            </Box>

            {loading ? (
              <Grid container spacing={4}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Grid size={{ xs: 12, sm: viewMode === 'list' ? 12 : 6, lg: viewMode === 'list' ? 12 : 4 }} key={n}>
                    <Skeleton variant="rounded" height={450} sx={{ borderRadius: 5 }} />
                  </Grid>
                ))}
              </Grid>
            ) : auctions && auctions.content.length > 0 ? (
              <>
                <Grid container spacing={4}>
                  {auctions.content.map((auction) => (
                    <Grid size={{ xs: 12, sm: viewMode === 'list' ? 12 : 6, lg: viewMode === 'list' ? 12 : 4 }} key={auction.id}>
                      <Card
                        onClick={() => navigate(`/auctions/${auction.id}`)}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: viewMode === 'list' ? 'row' : 'column',
                          p: 1.5,
                        }}
                      >
                        <Box sx={{ position: 'relative', width: viewMode === 'list' ? 320 : '100%', borderRadius: '18px', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={auction.imageUrls?.[0] || 'https://images.unsplash.com/photo-1579546678183-a84fe535194d'}
                            sx={{ height: viewMode === 'list' ? '100%' : 240, objectFit: 'cover' }}
                          />
                          <IconButton
                            onClick={(e) => toggleWatchlist(auction.id, e)}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(8px)',
                              color: theme.palette.mode === 'dark' ? '#F8FAFC' : '#64748B',
                              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 1)', color: '#10B981' }
                            }}
                          >
                            {watchlist.has(auction.id) ? <Favorite sx={{ color: '#F43F5E' }} /> : <FavoriteBorder />}
                          </IconButton>
                          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                            <Chip
                              label={auction.status}
                              sx={{
                                fontWeight: 900,
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: auction.status === 'ACTIVE' ? '#10B981' : '#F59E0B'
                              }}
                            />
                          </Box>
                        </Box>

                        <CardContent sx={{ flexGrow: 1, pt: viewMode === 'list' ? 1 : 3, px: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800 }}>
                              {auction.category}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#F43F5E', fontWeight: 800 }}>
                              {getTimeRemaining(auction.endDate)}
                            </Typography>
                          </Box>

                          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }} noWrap>
                            {auction.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 3
                          }}>
                            {auction.description}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Current High Bid</Typography>
                              <Typography variant="h4" className="emerald-gradient-text" sx={{ fontWeight: 900 }}>
                                {formatPrice(auction.currentPrice)}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary">Bids</Typography>
                              <Typography variant="h6" sx={{ fontWeight: 800 }}>{auction.totalBids || 0} Bids</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {auctions.totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={10}>
                    <Pagination
                      count={auctions.totalPages}
                      page={page + 1}
                      onChange={(_e, v) => setPage(v - 1)}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 15 }} className="glass-panel">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>No results found</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>Try changing your filters.</Typography>
                <Button variant="contained" onClick={handleClearFilters} sx={{ borderRadius: '12px', px: 4 }}>
                  Reset All Filters
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 320, backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC', backgroundImage: 'none' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
        </Box>
        <FilterContent />
      </Drawer>
    </Box>
  );
};

export default ModernAuctionListPage;