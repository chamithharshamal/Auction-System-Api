import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import api from '../../services/api';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    auctionId: string;
    amount: number;
    onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    onClose,
    auctionId,
    amount,
    onPaymentSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePay = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/payment/process', {
                auctionId,
                ...formData
            });
            onPaymentSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Secure Checkout</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Amount to Pay: ${amount}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Card Number"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                placeholder="0000 0000 0000 0000"
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                label="Expiry Date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                placeholder="MM/YY"
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                type="password"
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        * This is a mock payment gateway. No real transaction will occur.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handlePay}
                    variant="contained"
                    disabled={loading || !formData.cardNumber || !formData.expiryDate || !formData.cvv}
                >
                    {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
