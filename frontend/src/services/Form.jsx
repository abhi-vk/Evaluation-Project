import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Utility function to get headers with token and optional workspaceId
const getAuthHeadersWithWorkspace = () => {
    const token = localStorage.getItem('authToken');
    const workspaceId = localStorage.getItem('workspaceId');
    if (!token) throw new Error('Authentication token is missing');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(workspaceId && { 'workspace-id': workspaceId }),
    };
};

// Utility function to handle API response
const handleApiResponse = (response, successMessage) => {
    if (response.status === 'success') {
        if (successMessage) toast.success(successMessage);
        return response.data;
    } else {
        handleApiRes(response);
    }
};

// Validate folderId
const isValidFolderId = (folderId) => {
    return folderId && (typeof folderId === 'string' || typeof folderId === 'number');
};

// Create Form
export const createFormApi = async (folderId, formName) => {
    try {
        const body = folderId ? { folderId, formName } : { formName };
        const response = await fetch(`${baseURL}/form/create`, {
            method: 'POST',
            headers: getAuthHeadersWithWorkspace(),
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return handleApiResponse(data, 'Form created successfully');
    } catch (error) {
        handleApiErr(error);
    }
};

// Fetch All Forms
export const fetchAllFormApi = async (token, navigate) => {
    try {
        const headers = getAuthHeadersWithWorkspace();
        

        const response = await fetch(`${baseURL}/form/view`, {
            method: 'GET',
            headers: headers,
        });

        if (response.ok) {
            const data = await response.json();
            const { status, data: formData } = data;

            if (status === 'success') {
                return formData;
            } else {
                handleApiRes(data); // Handle non-success status
            }
        } else {
            const errorData = await response.json();
            console.error('API Error:', errorData); // Log the error data
            throw new Error('Failed to fetch forms');
        }
    } catch (error) {
        console.error('API Error:', error);
        handleApiErr(error, navigate); // Handle fetch or network errors
    }
};



// Fetch Form by ID
export const fetchFormByIdApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/view/${formId}`, {
            method: 'GET',
            headers: getAuthHeadersWithWorkspace(),
        });

        const data = await response.json();
        return handleApiResponse(data);
    } catch (error) {
        handleApiErr(error);
    }
};

// Update Form
export const updateFormApi = async (formId, formData) => {
    try {
        const response = await fetch(`${baseURL}/form/update/${formId}`, {
            method: 'PATCH',
            headers: getAuthHeadersWithWorkspace(),
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        return handleApiResponse(data, 'Form updated successfully');
    } catch (error) {
        handleApiErr(error);
    }
};

// Delete Form
export const deleteFormApi = async (formId) => {
    try {
        // Log formId to check if it's valid
        console.log('Deleting Form ID:', formId);

        // If formId is not valid, throw an error
        if (!formId) {
            console.error('Form ID is required');
            return;
        }

        const response = await fetch(`${baseURL}/form/delete/${formId}`, {
            method: 'DELETE',
            headers: getAuthHeadersWithWorkspace(),
        });

        // Check if the response is ok
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from server:', errorData); // Log error response
            throw new Error('Failed to delete form');
        }

        // Parse the response
        const data = await response.json();

        // Handle the API response and show success message
        return handleApiResponse(data, 'Form deleted successfully');
    } catch (error) {
        console.error('Error:', error); // Log the error in the console
        handleApiErr(error); // Call error handler
    }
};


// Share Form
export const shareFormApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/share/${formId}`, {
            method: 'GET',
            headers: getAuthHeadersWithWorkspace(),
        });

        const data = await response.json();
        return handleApiResponse(data, 'Form shared successfully');
    } catch (error) {
        handleApiErr(error);
    }
};

// Count Form Hits
export const countFormHitApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/hits/${formId}`, {
            method: 'POST',
            headers: getAuthHeadersWithWorkspace(),
        });

        const data = await response.json();
        return handleApiResponse(data);
    } catch (error) {
        handleApiErr(error);
    }
};

// Save Form Response
export const saveFormResponseApi = async (formId, formResponse) => {
    try {
        const response = await fetch(`${baseURL}/form/response/${formId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formResponse),
        });

        const data = await response.json();
        return handleApiResponse(data, 'Response saved successfully');
    } catch (error) {
        handleApiErr(error);
    }
};
