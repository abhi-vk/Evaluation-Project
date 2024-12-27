import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const [token, setToken] = useState(null);
    const [workspaceId, setWorkspaceId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedWorkspaceId = localStorage.getItem('workspaceId');

        if (!storedToken) {
            navigate('/login');
        } else {
            setToken(storedToken);
            setWorkspaceId(storedWorkspaceId);
        }
    }, [navigate]);

    return { token, workspaceId };
};

export default useAuth;
