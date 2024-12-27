import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// User Login API
export const userLoginApi = async (userData, navigate) => {
    try {
        const response = await fetch(`${baseURL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, token, workspaces } = data;

            if (status === 'success') {
                // Save token and workspace info in localStorage
                localStorage.setItem('authToken', token);
                if (workspaces && workspaces.length > 0) {
                    localStorage.setItem('workspaceId', workspaces[0]._id); // Assuming you want to save the first workspace
                }
                return token; // You may also return token here if needed for other operations
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        handleApiErr(error, navigate);
    }
};

// User Register API
export const userRegisterApi = async (userData, navigate) => {
    try {
        const response = await fetch(`${baseURL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, msg } = data;

            if (status === 'success') {
                toast.success(msg);
                return true;
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Registration failed');
        }
    } catch (error) {
        handleApiErr(error, navigate);
    }
};

// User Update API
export const userUpdateApi = async (userData, navigate) => {
    const token = localStorage.getItem('authToken'); // Get token from localStorage

    if (!token) {
        toast.error('Authorization token is missing');
        navigate('/login');
        return;
    }

    try {
        const response = await fetch(`${baseURL}/user/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Make sure the token is sent correctly
            },
            body: JSON.stringify(userData),
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, msg } = data;

            if (status === 'success') {
                toast.success(msg);
                return true;
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        handleApiErr(error, navigate); // Handle fetch errors
    }
};

// User Dashboard API
export const userDashboardApi = async (navigate) => {
    const token = localStorage.getItem('authToken'); // Get token from localStorage

    if (!token) {
        navigate('/login');
        return; // Redirect if no token found
    }

    try {
        const response = await fetch(`${baseURL}/user/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Send the token in the Authorization header
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, user } = data; // Destructure `user` from the response

            // Only handle errors if the status is not 'success'
            if (status === 'success' && user) {
                return user; // Return the user data
            } else {
                console.error('API Response Error:', data);
                handleApiRes(data); // Handle error if any issue with the response
            }
        } else {
            throw new Error('Failed to fetch dashboard data');
        }
    } catch (error) {
        handleApiErr(error, navigate); // Handle fetch errors
    }
};
