import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Utility to handle API response logic
const handleApiResponse = async (response, successMessage) => {
    if (response.ok) { // Adjusted to use `response.ok` for fetch
        const data = await response.json();
        const { status, msg } = data;

        if (status === 'success') {
            if (successMessage) toast.success(msg);
            return data.data || {}; // Safeguard in case `data` is undefined
        } else {
            handleApiRes(data);
        }
    } else {
        throw new Error('API request failed');
    }
};

// Utility to get common headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // Ensure token is stored correctly
    if (!token) throw new Error('Auth token is missing');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Create Folder API
export const createFolderApi = async (folderName) => {
    try {
        const response = await fetch(`${baseURL}/folder/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ folderName }),
        });

        return handleApiResponse(response, 'Folder created successfully');
    } catch (error) {
        handleApiErr(error);
    }
};

// Fetch All Folders
export const fetchAllFolderApi = async () => {
    try {
        const response = await fetch(`${baseURL}/folder/view`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        return handleApiResponse(response);
    } catch (error) {
        handleApiErr(error);
    }
};


export const fetchAllFormByFolderApi = async (folderId) => {
    try {
        const response = await fetch(`${baseURL}/folder/view/${folderId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        return handleApiResponse(response);
    } catch (error) {
        handleApiErr(error);
    }
};

// Delete Folder API
export const deleteFolderApi = async (folderId) => {
    try {
        const response = await fetch(`${baseURL}/folder/delete/${folderId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        return handleApiResponse(response, 'Folder deleted successfully');
    } catch (error) {
        handleApiErr(error);
    }
};
