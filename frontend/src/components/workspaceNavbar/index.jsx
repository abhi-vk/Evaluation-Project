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
    const [hasFetched, setHasFetched] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Initialize theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

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
            setWorkspaceId(newFormId);
            navigate(`/workspace?wid=${newFormId}`);
        } else {
            toast.error('Form creation failed. Please try again.');
        }
    };

    const fetchFormById = async () => {
        const data = await fetchFormByIdApi(formId, token);
        if (data) {
            setFormName(data.formName);
            setFormSequence(data.formSequence);
            setHasFetched(true);
        } else {
            toast.error('Failed to fetch form data.');
        }
    };

    const updateForm = async () => {
        if (formName.trim().length === 0) return;

        const data = await updateFormApi(formId, { formName }, token);
        if (data) setFormName(formName);
    };

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

    const copyFormLink = async () => {
        const link = `${window.location.origin}/share/${formId}`;
        try {
            await navigator.clipboard.writeText(link);
            toast.success('Form link copied successfully.');
        } catch (error) {
            toast.error('Failed to copy the link.');
        }
    };

    useEffect(() => {
        if (token && formId && !hasFetched) {
            fetchFormById();
        }
    }, [token, formId, hasFetched]);

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
                 <div className={styles.toggleContainer}>
                          <span>Light</span>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={theme === "dark"}
                              onChange={toggleTheme}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span>Dark</span>
                        </div>
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
