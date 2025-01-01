import { toast } from 'react-toastify';
import { handleApiRes, handleApiErr } from '../auth/apiUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Invite User API
export const inviteUserApi = async (inviteeEmail, permission, navigate) => {
    const token = localStorage.getItem('authToken'); 

    if (!token) {
        toast.error('Authorization token is missing');
        navigate('/login');
        return;
    }

    try {
        const response = await fetch(`${baseURL}/workspace/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ inviteeEmail, permission }),
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
            throw new Error('Failed to invite user');
        }
    } catch (error) {
        handleApiErr(error, navigate);
    }
};

// Switch Workspace API
export const switchWorkspaceApi = async (workspaceId, navigate) => {
    const token = localStorage.getItem('authToken'); 

    if (!token) {
        toast.error('Authorization token is missing');
        navigate('/login');
        return;
    }

    try {
        const response = await fetch(`${baseURL}/workspace/switch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ workspaceId }),
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, token: newToken, workspace, msg } = data;

            if (status === 'success') {
                localStorage.setItem('authToken', newToken);
                localStorage.setItem('workspaceId', workspace.id);
                toast.success(msg);
                return workspace; 
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Failed to switch workspace');
        }
    } catch (error) {
        handleApiErr(error, navigate);
    }
};

// Generate Invite Link API
export const generateInviteLinkApi = async (navigate) => {
    const token = localStorage.getItem('authToken'); 

    if (!token) {
        toast.error('Authorization token is missing');
        navigate('/login');
        return;
    }

    try {
        const response = await fetch(`${baseURL}/workspace/invite-link`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, inviteLink, msg } = data;

            if (status === 'success') {
                toast.success(msg);
                return inviteLink;
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Failed to generate invite link');
        }
    } catch (error) {
        handleApiErr(error, navigate);
    }
};

// Handle Workspace Join API
export const handleWorkspaceJoinApi = async (workspaceId, navigate) => {
    const token = localStorage.getItem('authToken'); 

    if (!token) {
        toast.error('Authorization token is missing');
        navigate('/login');
        return;
    }

    try {
        const response = await fetch(`${baseURL}/workspace/join/${workspaceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            const { status, msg, workspace } = data;

            if (status === 'success') {
                toast.success(msg);
                return workspace;
            } else {
                handleApiRes(data);
            }
        } else {
            throw new Error('Failed to join workspace');
        }
    } catch (error) {
        handleApiErr(error, navigate);
    }
};
