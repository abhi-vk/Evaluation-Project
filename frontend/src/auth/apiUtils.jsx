import { toast } from 'react-toastify';

// Handle API response
export const handleApiRes = (response) => {
    const { status, msg } = response;
    
    // JWT Error handling
    if (status === 'jwtError') {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';  // Optionally redirect to login
        throw new Error('JWT Error');
    } else {
        // Show error message
        if (msg) {
            toast.error(msg);
        } else {
            toast.error('An unexpected error occurred. Please try again.');
        }
    }
};

// Handle API error (e.g., network or 401 error)
export const handleApiErr = (error, navigate) => {
    // Unauthorized error (401)
    if (error.response?.status === 401) {
        localStorage.removeItem("authToken"); // Clear invalid token
        toast.error('Session expired. Please log in again.');
        if (navigate) navigate('/login'); // Redirect if navigate is provided
    } else {
        console.error("API Error:", error.message || error);
    }
};
