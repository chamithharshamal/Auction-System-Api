/**
 * Resolves an image URL to handle cases where the URL might be hardcoded to localhost
 * in the database but the application is being accessed from a hosted environment.
 */
export const resolveImageUrl = (url: string | undefined): string => {
    if (!url) {
        // Return a default placeholder if no URL is provided
        return 'https://images.unsplash.com/photo-1579546678183-a84fe535194d';
    }

    // If it's already a full external URL (like Unsplash), return as is
    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        return url;
    }

    // Get the base API URL from environment variables
    // VITE_API_BASE_URL usually ends with /api, e.g., https://api.example.com/api
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

    // Extract just the domain and port part for replacement
    // This handles http://localhost:8080/api/files/image.jpg -> https://hosted.com/api/files/image.jpg
    if (url.includes('localhost:8080') || url.includes('127.0.0.1:8080')) {
        const hostedBaseUrl = apiBaseUrl.replace(/\/api$/, ''); // Remove trailing /api if present
        return url.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/, hostedBaseUrl);
    }

    return url;
};
