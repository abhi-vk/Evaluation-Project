import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;


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
export const createFormApi = async (folderId, formName, token) => {
    try {
        const body = folderId ? { folderId, formName } : { formName };
        const response = await fetch(`${baseURL}/form/create`, {
            method: 'POST',
            headers: getAuthHeadersWithWorkspace(),
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log("API response JSON:", data);

        if (response.ok) {
            toast.success(data.msg || "Form created successfully!");
            return {
                formId: data.formId,
                msg: data.msg,
            };
        } else {
            const errorMsg = data.msg || "An error occurred. Please try again.";
            toast.error(errorMsg); 
            return {
                error: errorMsg,
            };
        }
    } catch (error) {
        const networkErrorMsg = "A network error occurred. Please try again later.";
        console.error("Error in API call:", error);
        toast.error(networkErrorMsg); 
        return {
            error: networkErrorMsg,
        };
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
                handleApiRes(data); 
            }
        } else {
            const errorData = await response.json();
            console.error('API Error:', errorData); 
            throw new Error('Failed to fetch forms');
        }
    } catch (error) {
        console.error('API Error:', error);
        handleApiErr(error, navigate); 
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


export const deleteFormApi = async (formId) => {
    try {
        console.log('Deleting Form ID:', formId);

        if (!formId) {
            console.error('Form ID is required');
            return null; 
        }

        const response = await fetch(`${baseURL}/form/delete/${formId}`, {
            method: 'DELETE',
            headers: getAuthHeadersWithWorkspace(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from server:', errorData);
            
            // Show toast with error message
            toast.error(errorData.msg || 'Failed to delete the form.');
            throw new Error('Failed to delete form');
        }

        const data = await response.json();
        console.log('Form deleted successfully:', data);

        // Show toast for successful deletion
        toast.success('Form deleted successfully!');

        return data; 
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error occurred while deleting the form.'); // Show general error toast
        return null; 
    }
};
  


// Share Form
export const shareFormApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/share/${formId}`, {
            method: 'GET',
            headers: {
                
            },
        });

        const data = await response.json();
        const { status, data: formData } = data;

        if (status === 'success') {
            return formData;
        } else {
            handleApiRes(data);  
        }
    } catch (error) {
        handleApiErr(error, navigate);  
    }
};

// Count Form Hits
export const countFormHitApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/hits/${formId}`, {
            method: 'POST',
            headers: {
                
            },
        });

        const data = await response.json();
        const { status, msg } = data;

        if (status === 'success') {
            return msg;
        } else {
            handleApiRes(data);  
        }
    } catch (error) {
        handleApiErr(error, navigate);  
    }
};

// Save Form Response
export const saveFormResponseApi = async (formId, formResponse) => {
    console.log(formResponse);
    try {
        const response = await fetch(`${baseURL}/form/response/${formId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(formResponse),
        });

        const data = await response.json();
        const { status, msg, data: responseData } = data;

        if (status === 'success') {
            return responseData;
        } else {
            handleApiRes(data);  
        }
    } catch (error) {
        handleApiErr(error, navigate);  
    }
};
