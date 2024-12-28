import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import { fetchAllFormByFolderApi } from '../../services/Folder';
import { deleteFormApi } from '../../services/Form';

import FormCard from '../../components/formCard';
import DeleteModal from '../../components/deleteModal';

import styles from './folder.module.css';

function Folders() {
    const rawToken = useAuth();
    const token = useMemo(() => rawToken, [rawToken]);
    const { fid } = useParams();

    const [allForm, setAllForm] = useState([]);
    const [formId, setFormId] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [hasFetched, setHasFetched] = useState(false); // Prevent redundant fetches

    const openDeleteModal = (id) => {
        setFormId(id);
        setDeleteModalOpen(true);
    };

    const fetchAllFormByFolder = useCallback(async () => {
        if (!token || hasFetched) return;
        try {
            const data = await fetchAllFormByFolderApi(fid, token);
            if (data) {
                setAllForm(data);
                setHasFetched(true); // Mark as fetched
            }
        } catch (error) {
            console.error('Error fetching forms:', error);
        }
    }, [fid, token, hasFetched]);

    const deleteForm = async () => {
        try {
            if (!formId || !token) return;
            const data = await deleteFormApi(formId, token);
            if (data) {
                setDeleteModalOpen(false);
                setHasFetched(false); // Allow re-fetch after deletion
                fetchAllFormByFolder();
            }
        } catch (error) {
            console.error('Error deleting form:', error);
        }
    };

    useEffect(() => {
        fetchAllFormByFolder();
    }, [fetchAllFormByFolder]);

    return (
        <div className={styles.section}>
            <Link to="/dashboard">
                <img src="/icons/arrow-back.png" className="goback" alt="Go back" />
            </Link>
            <div className={styles.forms}>
                <Link to={`/workspace?fid=${fid}`} className={styles.card}>
                    <img src="/icons/plus.png" alt="plus icon" />
                    <span>Create a typebot</span>
                </Link>
                <FormCard
                    forms={allForm}
                    onDelete={openDeleteModal}
                />
                {isDeleteModalOpen && (
                    <DeleteModal
                        entityType="form"
                        onDelete={deleteForm}
                        onClose={() => setDeleteModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default Folders;
