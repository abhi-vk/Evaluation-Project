import { toast } from 'react-toastify';


export const handleApiRes = (response) => {
    const { status, msg } = response;
    
  
    if (status === 'jwtError') {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login'; 
        throw new Error('JWT Error');
    } else {
        
        if (msg) {
            toast.error(msg);
        } else {
            toast.error('An unexpected error occurred. Please try again.');
        }
    }
};


export const handleApiErr = (error, navigate) => {
    // Unauthorized error (401)
    if (error.response?.status === 401) {
        localStorage.removeItem("authToken"); 
        toast.error('Session expired. Please log in again.');
        if (navigate) navigate('/login'); 
    } else {
        console.error("API Error:", error.message || error);
    }
};
