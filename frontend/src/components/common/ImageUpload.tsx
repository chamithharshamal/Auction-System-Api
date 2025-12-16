import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Paper,
    IconButton,
} from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onError: (message: string) => void;
    disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, onError, disabled }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate request
        if (!file.type.startsWith('image/')) {
            onError('Please select an image file');
            return;
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            onError('File size must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // We need to use the full URL if we're not proxying, or relative if we are.
            // Assuming Vite proxy is set up or we use a base URL configuration.
            // For now, let's assume relative path /api/files/upload which is proxied
            // OR use the import.meta.env.VITE_API_URL if available.

            const API_URL = 'http://localhost:8080/api'; // Hardcoded for now based on context, ideally from env

            const response = await axios.post(`${API_URL}/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                onUpload(response.data.data.fileUrl);
            } else {
                onError(response.data.message || 'Upload failed');
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            onError(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Box>
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={disabled || uploading}
            />
            <Button
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                fullWidth
                sx={{
                    height: 56,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                    }
                }}
            >
                {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
        </Box>
    );
};

export default ImageUpload;
