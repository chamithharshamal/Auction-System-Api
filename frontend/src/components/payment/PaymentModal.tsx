import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Alert,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';
import { PayPalButtons } from "@paypal/react-paypal-js";

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
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async (data: any, actions: any) => {
        try {
            await actions.order.capture();
            // Call backend to verify and save payment
            await api.post('/payment/process', {
                auctionId,
                paymentMethod: 'PAYPAL',
                paypalOrderId: data.orderID
            });
            onPaymentSuccess();
            onClose();
        } catch (err: any) {
            console.error("Payment Error: ", err);
            setError("Payment failed. Please try again.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                        Total: ${amount.toFixed(2)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        Complete your purchase securely with PayPal.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box sx={{ mt: 3, minHeight: 150 }}>
                        <PayPalButtons
                            style={{ layout: "vertical" }}
                            createOrder={(_data, actions) => {
                                return actions.order.create({
                                    intent: "CAPTURE",
                                    purchase_units: [
                                        {
                                            amount: {
                                                currency_code: "USD",
                                                value: amount.toString(),
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
            </DialogContent>
        </Dialog>
    );
};
