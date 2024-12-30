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
            return {
                formId: data.formId,
                msg: data.msg
            };
        } else {
            console.error("API call failed", response.status, response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Error in API call:", error);
        handleApiErr(error);
        return null;
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
      console.log('Deleting Form ID:', formId);
  
      if (!formId) {
        console.error('Form ID is required');
        return null; // Return null if formId is not provided
      }
  
      const response = await fetch(`${baseURL}/form/delete/${formId}`, {
        method: 'DELETE',
        headers: getAuthHeadersWithWorkspace(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from server:', errorData);
        throw new Error('Failed to delete form');
      }
  
      const data = await response.json();
      console.log('Form deleted successfully:', data);
  
      return data; // Return data for further processing
    } catch (error) {
      console.error('Error:', error);
      handleApiErr(error); // Handle error appropriately
      return null; // Return null in case of error
    }
  };
  

// Share Form
// Share Form
export const shareFormApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/share/${formId}`, {
            method: 'GET',
            headers: {
                // Add any necessary headers here, if required
            },
        });

        const data = await response.json();
        const { status, data: formData } = data;

        if (status === 'success') {
            return formData;
        } else {
            handleApiRes(data);  // Handle error or response if status is not success
        }
    } catch (error) {
        handleApiErr(error, navigate);  // Handle error
    }
};

// Count Form Hits
export const countFormHitApi = async (formId) => {
    try {
        const response = await fetch(`${baseURL}/form/hits/${formId}`, {
            method: 'POST',
            headers: {
                // Add any necessary headers here, if required
            },
        });

        const data = await response.json();
        const { status, msg } = data;

        if (status === 'success') {
            return msg;
        } else {
            handleApiRes(data);  // Handle error or response if status is not success
        }
    } catch (error) {
        handleApiErr(error, navigate);  // Handle error
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
                // Add any necessary headers here, if required
            },
            body: JSON.stringify(formResponse),
        });

        const data = await response.json();
        const { status, msg, data: responseData } = data;

        if (status === 'success') {
            return responseData;
        } else {
            handleApiRes(data);  // Handle error or response if status is not success
        }
    } catch (error) {
        handleApiErr(error, navigate);  // Handle error
    }
};
