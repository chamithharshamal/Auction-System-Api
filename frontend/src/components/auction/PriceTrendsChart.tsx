import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

interface PriceTrend {
    amount: number;
    timestamp: string;
    bidderName: string;
}

interface PriceTrendsChartProps {
    data: PriceTrend[];
    startingPrice: number;
}

const PriceTrendsChart: React.FC<PriceTrendsChartProps> = ({ data, startingPrice }) => {
    const theme = useTheme();

    // If no bids, show the starting price as the only data point
    const chartData = data.length > 0
        ? data.map(bid => ({
            ...bid,
            time: new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))
        : [{ amount: startingPrice, time: 'Start', bidderName: 'Initial Price' }];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
        >
            <Box display="flex" alignItems="center" gap={1} mb={3}>
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight="600">
                    Price Progression
                </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                            tickFormatter={formatCurrency}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                padding: '12px',
                            }}
                            formatter={(value: any) => [formatPrice(Number(value || 0)), 'Current Bid']}
                            labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            {data.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                    Visualizing the last {data.length} bids. The "Heat" is rising! 🔥
                </Typography>
            )}
        </Paper>
    );
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

export default PriceTrendsChart;
