import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Utility to handle API response logic
const handleApiResponse = async (response, successMessage) => {
    if (response.ok) { 
        const data = await response.json();
        const { status, msg } = data;

        if (status === 'success') {
            if (successMessage) toast.success(msg);
            return data.data || {}; 
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
        console.log("Request to create folder:", folderName);

        const response = await fetch(`${baseURL}/folder/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ folderName }),
        });

        const responseBody = await response.json();
        console.log("Response Status:", response.status, "Response Body:", responseBody);

        if (response.ok) {
            toast.success('Folder created successfully');
            return responseBody;
        } else {
            // Backend-specific error message handling
            const errorMessage = responseBody?.msg || responseBody?.message || 'An error occurred while creating the folder.';

            if (errorMessage.includes('already exists')) {
                toast.error('A folder with this name already exists in the workspace.');
            } else {
                toast.error(errorMessage);
            }

            // Don't throw here to prevent triggering the catch block
            return Promise.reject(new Error(errorMessage));
        }
    } catch (error) {
        console.error("Error in createFolderApi:", error);

        // Show a generic error toast only if no specific error is handled above
        if (!error.message.includes('already exists') && !error.message.includes('An error occurred while creating the folder.')) {
            toast.error('Something went wrong. Please try again.');
        }

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
