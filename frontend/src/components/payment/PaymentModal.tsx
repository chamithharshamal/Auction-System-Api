import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Alert,
    IconButton,
    TextField,
    Button,
    Divider,
    Grid,
    MenuItem,
    Paper,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../../contexts/AuthContext';

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
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [showPayPal, setShowPayPal] = useState(false);

    // Shipping details state
    const [shippingName, setShippingName] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingPhoneNumber, setShippingPhoneNumber] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('United States');

    const deliveryCharge = 1.00;
    const totalToPay = amount + deliveryCharge;

    // Pre-fill user details
    useEffect(() => {
        if (user) {
            setShippingName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
            setShippingPhoneNumber(user.phoneNumber || '');
        }
    }, [user, open]);

    const handleApprove = async (data: any, actions: any) => {
        try {
            await actions.order.capture();
            // Call backend to verify and save payment
            await api.post('/payment/process', {
                auctionId,
                paymentMethod: 'PAYPAL',
                paypalOrderId: data.orderID,
                shippingName,
                shippingAddress,
                shippingPhoneNumber,
                city,
                zipCode,
                country,
                deliveryCharge,
                totalAmount: totalToPay
            });
            onPaymentSuccess();
            onClose();
        } catch (err: any) {
            console.error("Payment Error: ", err);
            setError("Payment failed. Please try again.");
        }
    };

    const handleProceedToPayment = () => {
        if (!shippingName || !shippingAddress || !shippingPhoneNumber || !city || !zipCode || !country) {
            setError("All shipping details are required.");
            return;
        }
        setError(null);
        setShowPayPal(true);
    };

    const handleReset = () => {
        setShowPayPal(false);
        setError(null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Secure Checkout
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ p: 1 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!showPayPal ? (
                        <Grid container spacing={4}>
                            {/* Left Side: Shipping Form */}
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                                    Shipping Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            variant="outlined"
                                            size="small"
                                            value={shippingName}
                                            onChange={(e) => setShippingName(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Shipping Address"
                                            variant="outlined"
                                            size="small"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            multiline
                                            rows={2}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            variant="outlined"
                                            size="small"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Zip Code"
                                            variant="outlined"
                                            size="small"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Country"
                                            variant="outlined"
                                            size="small"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            required
                                        >
                                            <MenuItem value="United States">United States</MenuItem>
                                            <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                                            <MenuItem value="Canada">Canada</MenuItem>
                                            <MenuItem value="Australia">Australia</MenuItem>
                                            <MenuItem value="Germany">Germany</MenuItem>
                                            <MenuItem value="France">France</MenuItem>
                                            <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Telephone No"
                                            variant="outlined"
                                            size="small"
                                            value={shippingPhoneNumber}
                                            onChange={(e) => setShippingPhoneNumber(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Right Side: Order Summary */}
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        Order Summary
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Auction Price</Typography>
                                            <Typography variant="body2" fontWeight="500">${amount.toFixed(2)}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Delivery Charge</Typography>
                                            <Typography variant="body2" fontWeight="500">${deliveryCharge.toFixed(2)}</Typography>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6" fontWeight="bold" color="primary">Total to Pay</Typography>
                                            <Typography variant="h6" fontWeight="bold" color="primary">${totalToPay.toFixed(2)}</Typography>
                                        </Box>
                                    </Stack>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handleProceedToPayment}
                                        sx={{ mt: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2, textTransform: 'none', fontSize: '1.1rem' }}
                                    >
                                        Proceed to PayPal
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Paper elevation={0} sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, textAlign: 'left' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Shipping to:
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {shippingName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {shippingAddress}, {city}, {zipCode}, {country}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Phone: {shippingPhoneNumber}
                                </Typography>
                                <Button size="small" onClick={handleReset} sx={{ mt: 1, textTransform: 'none' }}>
                                    Edit Details
                                </Button>
                            </Paper>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                Total: ${totalToPay.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Complete your purchase securely with PayPal.
                            </Typography>

                            <Box sx={{ minHeight: 150, maxWidth: 400, mx: 'auto' }}>
                                <PayPalButtons
                                    style={{ layout: "vertical" }}
                                    createOrder={(_data, actions) => {
                                        return actions.order.create({
                                            intent: "CAPTURE",
                                            purchase_units: [
                                                {
                                                    amount: {
                                                        currency_code: "USD",
                                                        value: totalToPay.toString(),
                                                    },
                                                },
                                            ],
                                        });
                                    }}
                                    onApprove={handleApprove}
                                    onError={(err) => {
                                        console.error("PayPal Error:", err);
                                        setError("An error occurred with PayPal.");
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};
