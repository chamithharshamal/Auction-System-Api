import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Grid,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import {
  Gavel,
  Schedule,
  Visibility,
  CheckCircle,
  TrendingDown,
  SentimentVeryDissatisfied,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Bid, PaginatedResponse } from '../../types/api';
import { bidService } from '../../services/bidService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyBidsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<PaginatedResponse<Bid> | null>(null);
  const [winningBids, setWinningBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      loadMyBids();
    }
  }, [user]);

  const loadMyBids = async () => {
    try {
      setLoading(true);
      const [bidsData, winningData] = await Promise.all([
        bidService.getBidsByBidder(user!.id, 0, 20),
        bidService.getWinningBidsForUser(user!.id),
      ]);
      setBids(bidsData);
      setWinningBids(winningData);
    } catch (error) {
      console.error('Error loading my bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'WINNING': return '#10B981';
      case 'ACTIVE': return '#3B82F6';
      case 'OUTBID': return '#EF4444';
      default: return '#64748B';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bids..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 12 } }} className="page-fade-in">
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-2px', fontFamily: 'Outfit, sans-serif' }}>
            My Bids
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            List of auctions you have joined.
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Tabs
            value={tabValue}
            onChange={(_e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #10B981, #3B82F6)'
              },
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'none',
                minWidth: 160,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'text.primary'
                }
              }
            }}
          >
            <Tab label={`All Bids (${bids?.totalElements || 0})`} />
            <Tab label={`Won Auctions (${winningBids.length})`} />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box>
            {bids && bids.content.length > 0 ? (
              <Grid container spacing={4}>
                {bids.content.map((bid) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bid.id}>
                    <Card
                      className="glass-panel"
                      sx={{
                        height: '100%',
                        borderRadius: '24px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${alpha(getBidStatusColor(bid.status), 0.1)}`,
                          borderColor: alpha(getBidStatusColor(bid.status), 0.3)
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }} noWrap>
                            {bid.auctionItemTitle}
                          </Typography>
                          <Chip
                            label={bid.status}
                            sx={{
                              bgcolor: alpha(getBidStatusColor(bid.status), 0.1),
                              color: getBidStatusColor(bid.status),
                              fontWeight: 800,
                              borderRadius: '8px',
                              border: `1px solid ${alpha(getBidStatusColor(bid.status), 0.2)}`
                            }}
                          />
                        </Box>

                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Your Bid</Typography>
                            <Typography variant="h4" sx={{ color: getBidStatusColor(bid.status), fontWeight: 900 }}>{formatPrice(bid.amount)}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1.5} sx={{ color: 'text.secondary' }}>
                            <Schedule sx={{ fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(bid.timestamp).toLocaleString()}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/auctions/${bid.auctionItemId}`)}
                          sx={{ borderRadius: '16px', height: 48, fontWeight: 700 }}
                        >
                          View Auction
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper className="glass-panel" sx={{ p: 10, textAlign: 'center', borderRadius: '32px' }}>
                <Box sx={{ width: 100, height: 100, borderRadius: '30px', bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
                  <TrendingDown sx={{ fontSize: 48, color: '#3B82F6' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Outfit, sans-serif' }}>No Bids Found</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6 }}>You haven't placed any bids yet. Go find something you like!</Typography>
                <Button
                  variant="contained"
                  startIcon={<Gavel />}
                  size="large"
                  onClick={() => navigate('/auctions')}
                  sx={{
                    height: 60, px: 6, borderRadius: '18px', fontWeight: 900,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Enter Marketplace
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {winningBids.length > 0 ? (
              <Grid container spacing={4}>
                {winningBids.map((bid) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bid.id}>
                    <Card
                      className="glass-panel"
                      sx={{
                        height: '100%',
                        borderRadius: '24px',
                        borderColor: alpha('#10B981', 0.5),
                        boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${alpha('#10B981', 0.1)}`
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }} noWrap>
                            {bid.auctionItemTitle}
                          </Typography>
                          <Chip
                            icon={<CheckCircle sx={{ color: '#10B981 !important' }} />}
                            label="WON"
                            sx={{
                              bgcolor: alpha('#10B981', 0.1),
                              color: '#10B981',
                              fontWeight: 800,
                              borderRadius: '8px',
                              border: `1px solid ${alpha('#10B981', 0.2)}`
                            }}
                          />
                        </Box>

                        <Stack spacing={2.5} sx={{ mb: 3 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Final Price</Typography>
                            <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 900 }}>{formatPrice(bid.amount)}</Typography>
                          </Box>

                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Congratulations! This item is now part of your collection.
                          </Typography>

                          <Box display="flex" alignItems="center" gap={1.5} sx={{ color: 'text.secondary' }}>
                            <Schedule sx={{ fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Closed {new Date(bid.timestamp).toLocaleString()}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>

                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/auctions/${bid.auctionItemId}`)}
                          sx={{
                            borderRadius: '16px', height: 48, fontWeight: 900,
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
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
              <Paper className="glass-panel" sx={{ p: 10, textAlign: 'center', borderRadius: '32px' }}>
                <Box sx={{ width: 100, height: 100, borderRadius: '30px', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
                  <SentimentVeryDissatisfied sx={{ fontSize: 48, color: '#EF4444' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Outfit, sans-serif' }}>No Wins Yet</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6 }}>You haven't won any auctions yet. Start bidding to win!</Typography>
                <Button
                  variant="contained"
                  startIcon={<Gavel />}
                  size="large"
                  onClick={() => navigate('/auctions')}
                  sx={{
                    height: 60, px: 6, borderRadius: '18px', fontWeight: 900,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  Find Items
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MyBidsPage;
