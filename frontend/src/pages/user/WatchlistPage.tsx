import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Chip,
    IconButton,
} from '@mui/material';
import { Visibility, Gavel, Favorite } from '@mui/icons-material';
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
            // Optimistically remove from state
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
            case 'ACTIVE': return 'success';
            case 'ENDED': return 'default';
            case 'CANCELLED': return 'error';
            default: return 'warning';
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading your watchlist..." />;
    }

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Watchlist
            </Typography>

            {watchlist.length > 0 ? (
                <Grid container spacing={3}>
                    {watchlist.map((auction) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={auction.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' },
                                    position: 'relative'
                                }}
                                onClick={() => navigate(`/auctions/${auction.id}`)}
                            >
                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                    <IconButton
                                        color="error"
                                        onClick={(e) => handleRemoveFromWatchlist(auction.id, e)}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                                    >
                                        <Favorite />
                                    </IconButton>
                                </Box>

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
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {auction.totalBids} bids
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        startIcon={<Visibility />}
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
            ) : (
                <Box textAlign="center" py={8}>
                    <Favorite sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Your watchlist is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Heart items to save them here for later
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Gavel />}
                        onClick={() => navigate('/auctions')}
                    >
                        Browse Auctions
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default WatchlistPage;
