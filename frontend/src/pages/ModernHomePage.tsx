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
    FormControl,
    Select,
    MenuItem,
    Grid,
    Skeleton,
    Avatar,
    useTheme,
} from '@mui/material';
import {
    Gavel,
    Schedule,
    ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { AuctionItem } from '../types/api';
import { auctionService } from '../services/auctionService';
import { resolveImageUrl } from '../utils/urlUtils';

const ModernHomePage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [featuredAuctions, setFeaturedAuctions] = useState<AuctionItem[]>([]);
    const [endingSoonAuctions, setEndingSoonAuctions] = useState<AuctionItem[]>([]);
    const [topAuctions, setTopAuctions] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        'Electronics', 'Art & Collectibles', 'Jewelry', 'Vehicles', 'Real Estate',
        'Sports & Recreation', 'Books & Media', 'Fashion', 'Home & Garden', 'Other',
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [featured, endingSoon, top] = await Promise.all([
                    auctionService.getRecentAuctions(6).catch(() => []),
                    auctionService.getAuctionsEndingSoon().catch(() => []),
                    auctionService.getTopAuctionsByPrice(4).catch(() => []),
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

    return (
        <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 12 } }} className="page-fade-in">
            {/* Hero Section */}
            <Container maxWidth="xl" sx={{ mb: { xs: 8, md: 15 } }}>
                <Grid container spacing={8} alignItems="center">
                    <Grid size={{ xs: 12, lg: 7 }} sx={{ pl: { lg: 10 } }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Chip
                                label="Join the Revolution 🚀"
                                color="primary"
                                sx={{ mb: 3, fontWeight: 800, px: 1, letterSpacing: '0.05em' }}
                            />
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3rem', md: '5rem' },
                                    mb: 3,
                                    lineHeight: 1,
                                }}
                            >
                                Bid. Win. <br />
                                <Box component="span" className="emerald-gradient-text">
                                    Own the Future.
                                </Box>
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{ mb: 6, color: 'text.secondary', maxWidth: 600, fontWeight: 400 }}
                            >
                                Experience the next generation of digital auctions. Secure, transparent, and absolutely thrilling.
                            </Typography>

                            {/* Cyber Search Box */}
                            <Paper
                                className="glass-panel"
                                sx={{
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    maxWidth: 650,
                                    gap: 1,
                                }}
                            >
                                <InputBase
                                    placeholder="Search for items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{
                                        flex: 1,
                                        ml: 3,
                                        fontSize: '1.2rem',
                                        fontWeight: 600,
                                    }}
                                />
                                <FormControl size="small" sx={{ minWidth: 160, display: { xs: 'none', sm: 'block' } }}>
                                    <Select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            fontWeight: 700,
                                            border: 'none',
                                            '& fieldset': { border: 'none' }
                                        }}
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        borderRadius: '16px',
                                        height: 56,
                                        px: 6,
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Search
                                </Button>
                            </Paper>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 5 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                sx={{
                                    width: 450,
                                    height: 450,
                                    borderRadius: '80px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    transform: 'rotate(-5deg)',
                                }}
                            >
                                <Gavel sx={{ fontSize: 200, color: '#10B981', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))' }} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Featured Section */}
            <Container maxWidth="xl">
                <Box sx={{ mb: 10 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
                        <Box>
                            <Typography variant="h3" sx={{ mb: 1 }}>Live Now</Typography>
                            <Typography color="text.secondary">Top featured auctions happening right now</Typography>
                        </Box>
                        <Button
                            variant="text"
                            endIcon={<ArrowForward />}
                            onClick={() => navigate('/auctions')}
                            sx={{ color: 'secondary.main', fontWeight: 800, fontSize: '1.1rem' }}
                        >
                            See All Auctions
                        </Button>
                    </Box>

                    {loading ? (
                        <Grid container spacing={4}>
                            {[1, 2, 3].map(i => (
                                <Grid size={{ xs: 12, md: 4 }} key={i}>
                                    <Skeleton variant="rounded" height={500} sx={{ borderRadius: 6 }} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Grid container spacing={4}>
                            {featuredAuctions.map(auction => (
                                <Grid size={{ xs: 12, md: 4 }} key={auction.id}>
                                    <Card
                                        onClick={() => navigate(`/auctions/${auction.id}`)}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            p: 1.5,
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', height: 280 }}>
                                            <CardMedia
                                                component="img"
                                                image={resolveImageUrl(auction.imageUrls?.[0])}
                                                sx={{ height: '100%', objectFit: 'cover' }}
                                            />
                                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                                <Chip
                                                    label={getTimeRemaining(auction.endDate)}
                                                    sx={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                                        backdropFilter: 'blur(8px)',
                                                        fontWeight: 900,
                                                        color: '#10B981'
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>{auction.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                {auction.description.substring(0, 80)}...
                                            </Typography>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Current Price</Typography>
                                                    <Typography variant="h4" className="emerald-gradient-text" sx={{ fontWeight: 900 }}>
                                                        {formatPrice(auction.currentPrice)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" color="text.secondary">Total Bids</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{auction.totalBids || 0}</Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>

                                        <CardActions sx={{ px: 2, pb: 2 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                sx={{ borderRadius: '12px' }}
                                            >
                                                Bid Now
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Second Row: Ending Soon & Top Bidders */}
                <Grid container spacing={6}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Typography variant="h4" sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                            <Schedule sx={{ mr: 2, color: 'secondary.main' }} /> Ending Soon
                        </Typography>
                        <Grid container spacing={3}>
                            {endingSoonAuctions.slice(0, 4).map(auction => (
                                <Grid size={{ xs: 12, sm: 6 }} key={auction.id}>
                                    <Box
                                        onClick={() => navigate(`/auctions/${auction.id}`)}
                                        className="glass-panel"
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            gap: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { background: 'rgba(30, 41, 59, 0.9)', transform: 'translateX(8px)' }
                                        }}
                                    >
                                        <Avatar
                                            src={resolveImageUrl(auction.imageUrls?.[0])}
                                            variant="rounded"
                                            sx={{ width: 80, height: 80, borderRadius: '12px' }}
                                        />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{auction.title}</Typography>
                                            <Typography variant="body2" sx={{ color: '#F43F5E', fontWeight: 900 }}>
                                                Closing in {getTimeRemaining(auction.endDate)}
                                            </Typography>
                                            <Typography variant="h6" className="emerald-gradient-text" sx={{ fontWeight: 900 }}>
                                                {formatPrice(auction.currentPrice)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Paper
                            className="glass-panel"
                            sx={{
                                p: 4,
                                height: '100%',
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)'
                            }}
                        >
                            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>🔥 Top Picks</Typography>
                            {topAuctions.slice(0, 5).map((auction, i) => (
                                <Box
                                    key={auction.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: i < topAuctions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{auction.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{auction.category}</Typography>
                                    </Box>
                                    <Typography variant="h6" color="primary.main">{formatPrice(auction.currentPrice)}</Typography>
                                </Box>
                            ))}
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate('/auctions')}
                                sx={{ mt: 2, borderRadius: '12px', py: 1.5, borderWidth: 2 }}
                            >
                                Browse Trends
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ModernHomePage;