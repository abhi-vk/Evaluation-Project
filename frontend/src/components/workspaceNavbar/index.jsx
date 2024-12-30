import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../auth/useAuth';
import { createFormApi, fetchFormByIdApi, updateFormApi } from "../../services/Form";
import styles from './workspaceNavbar.module.css';

function WorkspaceNavbar({ setWorkspaceId, updateFormSequence }) {
    const token = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [folderId, setFolderId] = useState(searchParams.get('fid'));
    const [formId, setFormId] = useState(searchParams.get('wid'));
    const [formName, setFormName] = useState('');
    const [formSequence, setFormSequence] = useState('');
    const [formNameError, setFormNameError] = useState('');
    const [hasFetched, setHasFetched] = useState(false); // To track if the form data is fetched

    // Create a new form
    const createForm = async () => {
        setFormNameError('');
        if (formName.trim().length === 0) {
            setFormNameError('Enter form name');
            return;
        }

        const response = await createFormApi(folderId, formName, token);
        if (response && response.formId) {
            const newFormId = response.formId;
            setFormId(newFormId);
            setWorkspaceId(newFormId);  // Pass the new formId to the parent
            navigate(`/workspace?wid=${newFormId}`);  // Navigate to the new workspace
        } else {
            toast.error("Form creation failed. Please try again.");
        }
    };

    // Fetch form data by ID
    const fetchFormById = async () => {
        const data = await fetchFormByIdApi(formId, token);
        if (data) {
            setFormName(data.formName);
            setFormSequence(data.formSequence);
            setHasFetched(true); // Mark as fetched
        } else {
            toast.error("Failed to fetch form data.");
        }
    };

    // Update the form name
    const updateForm = async () => {
        if (formName.trim().length === 0) return;

        const data = await updateFormApi(formId, { formName }, token);
        if (data) setFormName(formName);
    };

    // Save the form (either create or update)
    const handleFormSave = async () => {
        if (formId) {
            if (updateFormSequence) {
                await updateFormSequence();
                fetchFormById();
            }
            await updateForm();
        } else {
            await createForm();
        }
    };

    // Copy form link to clipboard
    const copyFormLink = async () => {
        const link = `${window.location.origin}/share/${formId}`;
        try {
            await navigator.clipboard.writeText(link);
            toast.success("Form link copied successfully.");
        } catch (error) {
            toast.error("Failed to copy the link.");
        }
    };

    // Fetch form data when `token` or `formId` changes
    useEffect(() => {
        if (token && formId && !hasFetched) {
            fetchFormById();  // Fetch form data only when `formId` and `token` are available
        }
    }, [token, formId, hasFetched]);  // Only run when `formId` or `token` changes

    return (
        <div className={styles.navbar}>
            <div className={styles.formTitle}>
                <input
                    type="text"
                    className={formNameError && 'error'}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter Form Name"
                />
            </div>
            <div className={styles.formNav}>
                <NavLink
                    to={formId ? `/workspace?wid=${formId}` : window.location}
                    className={({ isActive }) => isActive ? styles.active : ''}
                >
                    Flow
                </NavLink>
            
                <NavLink
                    to={formId ? `/response?wid=${formId}` : window.location}
                    className={({ isActive }) => isActive && formId ? styles.active : ''}
                >
                    Response
                </NavLink>
            </div>
            <div className={styles.formAction}>
                <button
                    disabled={formSequence.length === 0}
                    onClick={copyFormLink}
                >
                    Share
                </button>
                <button onClick={handleFormSave}>Save</button>
                <NavLink to="/dashboard">
                    <img src="/icons/close.png" alt="close icon" />
                </NavLink>
            </div>
        </div>
    );
}

export default WorkspaceNavbar;
