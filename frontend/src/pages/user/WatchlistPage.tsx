import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Chip,
    IconButton,
    Stack,
    Paper,
    alpha,
} from '@mui/material';
import { Visibility, Gavel, Favorite, FavoriteBorder, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { watchlistService } from '../../services/watchlistService';
import type { AuctionItem } from '../../types/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const WatchlistPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadWatchlist();
        }
    }, [user]);

    const loadWatchlist = async () => {
        try {
            setLoading(true);
            const data = await watchlistService.getWatchlist();
            setWatchlist(data);
        } catch (error) {
            console.error('Error loading watchlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWatchlist = async (auctionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await watchlistService.removeFromWatchlist(auctionId);
            setWatchlist(prev => prev.filter(item => item.id !== auctionId));
        } catch (error) {
            console.error('Failed to remove from watchlist:', error);
        }
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return '#10B981';
            case 'ENDED': return '#64748B';
            case 'CANCELLED': return '#EF4444';
            default: return '#F59E0B';
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading watchlist..." />;
    }

    return (
        <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 12 } }} className="page-fade-in">
            <Container maxWidth="lg">
                {/* Page Header */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-2px', fontFamily: 'Outfit, sans-serif' }}>
                        My Watchlist
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Items you are keeping an eye on.
                    </Typography>
                </Box>

                {watchlist.length > 0 ? (
                    <Grid container spacing={4}>
                        {watchlist.map((auction) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={auction.id}>
                                <Card
                                    className="glass-panel"
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            borderColor: 'rgba(59, 130, 246, 0.3)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.1)'
                                        },
                                        position: 'relative'
                                    }}
                                    onClick={() => navigate(`/auctions/${auction.id}`)}
                                >
                                    <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
                                        <IconButton
                                            onClick={(e) => handleRemoveFromWatchlist(auction.id, e)}
                                            sx={{
                                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                color: '#EF4444',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                            }}
                                        >
                                            <Favorite />
                                        </IconButton>
                                    </Box>

                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="240"
                                            image={auction.imageUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80'}
                                            alt={auction.title}
                                            sx={{ transition: 'transform 0.5s ease' }}
                                        />
                                        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                                            <Chip
                                                label={auction.status}
                                                sx={{
                                                    bgcolor: alpha(getStatusColor(auction.status), 0.2),
                                                    color: getStatusColor(auction.status),
                                                    fontWeight: 800,
                                                    backdropFilter: 'blur(8px)',
                                                    border: `1px solid ${alpha(getStatusColor(auction.status), 0.3)}`
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, fontFamily: 'Outfit, sans-serif' }} noWrap>
                                            {auction.title}
                                        </Typography>

                                        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Current Price</Typography>
                                                <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 900 }}>{formatPrice(auction.currentPrice)}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Time Left</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{getTimeRemaining(auction.endDate)}</Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                            <TrendingUp sx={{ fontSize: 18, color: '#10B981' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{auction.totalBids} active bids</Typography>
                                        </Stack>
                                    </CardContent>

                                    <Box sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<Visibility />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/auctions/${auction.id}`);
                                            }}
                                            sx={{
                                                borderRadius: '16px',
                                                height: 48,
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                                            }}
                                        >
                                            View Item
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        className="glass-panel"
                        sx={{
                            p: 10,
                            textAlign: 'center',
                            borderRadius: '32px',
                            border: '2px dashed rgba(255,255,255,0.05)'
                        }}
                    >
                        <Box sx={{ width: 100, height: 100, borderRadius: '30px', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
                            <FavoriteBorder sx={{ fontSize: 48, color: '#EF4444' }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
                            Watchlist is Empty
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6, maxWidth: 400, mx: 'auto' }}>
                            You haven't added any items to your watchlist yet. Browse the marketplace to find something you like.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Gavel />}
                            size="large"
                            onClick={() => navigate('/auctions')}
                            sx={{
                                height: 60,
                                px: 6,
                                borderRadius: '18px',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            Browse Market
                        </Button>
                    </Paper>
                )}
            </Container>
        </Box>
    );
};

export default WatchlistPage;
