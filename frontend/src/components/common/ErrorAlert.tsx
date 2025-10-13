import React from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

interface ErrorAlertProps {
  open: boolean;
  message: string;
  title?: string;
  onClose: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  open,
  message,
  title,
  onClose,
  severity = 'error',
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ErrorAlert;

