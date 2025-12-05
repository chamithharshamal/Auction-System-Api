import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  Gavel,
  AttachMoney,
  Schedule,
  Visibility,
  CheckCircle,
  Cancel,
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
      case 'WINNING':
        return 'success';
      case 'ACTIVE':
        return 'primary';
      case 'OUTBID':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBidStatusIcon = (status: string) => {
    switch (status) {
      case 'WINNING':
        return <CheckCircle />;
      case 'ACTIVE':
        return <Gavel />;
      case 'OUTBID':
        return <Cancel />;
      case 'CANCELLED':
        return <Cancel />;
      default:
        return <Gavel />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bids..." />;
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bids
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label={`All Bids (${bids?.totalElements || 0})`} />
          <Tab label={`Winning Bids (${winningBids.length})`} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          {bids && bids.content.length > 0 ? (
            <Grid container spacing={3}>
              {bids.content.map((bid) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bid.id}>
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
                    onClick={() => navigate(`/auctions/${bid.auctionItemId}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="h3" noWrap>
                          {bid.auctionItemTitle}
                        </Typography>
                        <Chip
                          icon={getBidStatusIcon(bid.status)}
                          label={bid.status}
                          color={getBidStatusColor(bid.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AttachMoney color="primary" />
                        <Typography variant="h5" color="primary.main">
                          {formatPrice(bid.amount)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Schedule color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(bid.timestamp).toLocaleString()}
                        </Typography>
                      </Box>

                      {bid.notes && (
                        <Typography variant="body2" color="text.secondary">
                          Note: {bid.notes}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/auctions/${bid.auctionItemId}`);
                        }}
                      >
                        View Auction
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Gavel sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No bids placed yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start bidding on auctions to see them here
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/auctions')}
              >
                Browse Auctions
              </Button>
            </Box>
          )}
        </>
      )}

      {tabValue === 1 && (
        <>
          {winningBids.length > 0 ? (
            <Grid container spacing={3}>
              {winningBids.map((bid) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bid.id}>
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
                      border: '2px solid',
                      borderColor: 'success.main',
                    }}
                    onClick={() => navigate(`/auctions/${bid.auctionItemId}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="h3" noWrap>
                          {bid.auctionItemTitle}
                        </Typography>
                        <Chip
                          icon={<CheckCircle />}
                          label="WINNING"
                          color="success"
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AttachMoney color="success" />
                        <Typography variant="h5" color="success.main">
                          {formatPrice(bid.amount)}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Congratulations! You won this auction.
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Won on {new Date(bid.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/auctions/${bid.auctionItemId}`);
                        }}
                      >
                        View Auction
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <CheckCircle sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No winning bids yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Keep bidding to win auctions!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/auctions')}
              >
                Browse Auctions
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default MyBidsPage;
