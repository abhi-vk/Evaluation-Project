import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

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
                localStorage.setItem('authToken', token);
                if (workspaces && workspaces.length > 0) {
                    localStorage.setItem('workspaceId', workspaces[0]._id);
                }
                toast.success('Login successful');
                return token;
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        handleApiErr(error, navigate);
        toast.error('Login failed');
    }
};

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
        toast.error('Registration failed');
    }
};

export const userUpdateApi = async (userData, navigate) => {
    const token = localStorage.getItem('authToken');

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
                Authorization: `Bearer ${token}`,
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
        handleApiErr(error, navigate);
        toast.error('Update failed');
    }
};

export const userDashboardApi = async (navigate) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        navigate('/login');
        return;
    }

    try {
        const response = await fetch(`${baseURL}/user/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, user } = data;

            if (status === 'success' && user) {
                return user;
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Failed to fetch dashboard data');
        }
    } catch (error) {
        handleApiErr(error, navigate);
        toast.error('Failed to fetch dashboard data');
    }
};
