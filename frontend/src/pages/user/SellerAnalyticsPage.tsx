import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    alpha,
    useTheme,
    Stack,
    LinearProgress
} from '@mui/material';
import {
    TrendingUp,
    Gavel,
    AttachMoney,
    CheckCircle,
    Storefront,
    ShowChart
} from '@mui/icons-material';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import type { SellerAnalytics } from '../../services/analyticsService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SellerAnalyticsPage: React.FC = () => {
    const theme = useTheme();
    const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await analyticsService.getSellerAnalytics();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <LoadingSpinner message="Calculating your insights..." />;
    if (!analytics) return <Typography color="error">Failed to load analytics data.</Typography>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const pieData = Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
        name,
        value
    }));

    const stats = [
        { label: 'Total Earnings', value: `$${analytics.totalEarnings.toFixed(2)}`, icon: <AttachMoney />, color: '#10b981' },
        { label: 'Total Bids', value: analytics.totalBidsReceived, icon: <Gavel />, color: '#3b82f6' },
        { label: 'Sold Items', value: analytics.soldItems, icon: <CheckCircle />, color: '#8b5cf6' },
        { label: 'Active Listings', value: analytics.activeListings, icon: <Storefront />, color: '#f59e0b' },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Seller Insights
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Real-time performance metrics and sales trends for your auctions.
                </Typography>
            </Box>

            {/* Top Stats Cards */}
            <Grid container spacing={3} mb={4}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 3,
                                        bgcolor: alpha(stat.color, 0.1),
                                        color: stat.color,
                                        display: 'flex'
                                    }}>
                                        {stat.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Sales Trends Chart */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={700}>Sales Trends</Typography>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <ShowChart color="primary" />
                            </Box>
                        </Stack>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={analytics.salesHistory}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={theme.palette.primary.main}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmt)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Performance & Distribution */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={3}>
                        {/* Success Rate Card */}
                        <Paper sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Auction Success Rate
                            </Typography>
                            <Box sx={{ position: 'relative', pt: 2, pb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h3" fontWeight={800} color="primary">
                                        {analytics.successRate.toFixed(0)}%
                                    </Typography>
                                    <TrendingUp color="primary" />
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={analytics.successRate}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {analytics.soldItems} out of {analytics.totalAuctions} auctions resulted in a sale.
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Category Distribution */}
                        <Paper sx={{ p: 3, borderRadius: 4, flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                Category Distribution
                            </Typography>
                            <Box sx={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {pieData.slice(0, 3).map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                                            <Typography variant="caption" fontWeight={600}>{item.name}</Typography>
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">{item.value}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
}

export default SellerAnalyticsPage;
