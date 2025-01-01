import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom'; // <-- Added Link import
import useAuth from '../../auth/useAuth';
import { fetchAllFormByFolderApi } from '../../services/Folder';
import { deleteFormApi, createFormApi } from '../../services/Form';

import FormCard from '../../components/formCard';
import DeleteModal from '../../components/deleteModal';
import CreateFormModal from '../../components/formModal';
import styles from "../../assets/dashboard.module.css";

function Folders() {
    const rawToken = useAuth();
    const token = useMemo(() => rawToken, [rawToken]);
    const { fid } = useParams();

    const [allForm, setAllForm] = useState([]);
    const [formId, setFormId] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isCreateFormModalOpen, setCreateFormModalOpen] = useState(false);
    const [formName, setFormName] = useState("");
    const [formNameError, setFormNameError] = useState("");

    const openDeleteModal = (id) => {
        setFormId(id);
        setDeleteModalOpen(true);
    };

    const openCreateFormModal = () => {
        setFormName("");
        setFormNameError("");
        setCreateFormModalOpen(true);
    };

    const fetchAllFormByFolder = useCallback(async () => {
        if (!token) return;
        try {
            const data = await fetchAllFormByFolderApi(fid, token);
            if (data) {
                setAllForm(data);
            }
        } catch (error) {
            console.error('Error fetching forms:', error);
        }
    }, [fid, token]);

    const createForm = async () => {
        setFormNameError("");
        if (formName.trim().length === 0) {
            setFormNameError("Enter form name");
            return;
        }
        try {
            const data = await createFormApi(fid, formName, token);
            if (data) {
                // Immediately add the new form to the state
                setAllForm((prevForms) => [
                    ...prevForms,
                    { formId: data.formId, formName: formName, msg: data.msg },
                ]);
                setFormName("");
                setCreateFormModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating form:', error);
        }
    };

    const deleteForm = async () => {
        try {
            if (!formId || !token) return;
            const data = await deleteFormApi(formId, token);
            if (data) {
                setDeleteModalOpen(false);
                fetchAllFormByFolder();  // Refetch form list after deletion
            }
        } catch (error) {
            console.error('Error deleting form:', error);
        }
    };

    useEffect(() => {
        fetchAllFormByFolder();  // Fetch forms when component mounts or fid/token changes
    }, [fetchAllFormByFolder]);

    return (
        <div className={styles.section}>
            <Link to="/dashboard">
                <img src="/icons/arrow-back.png" className="goback" alt="Go back" />
            </Link>
            <div className={styles.forms}>
                <button onClick={openCreateFormModal} className={styles.card}>
                    <img src="/icons/plus.png" alt="plus icon" />
                    <span>Create a typebot</span>
                </button>
                <FormCard
                    forms={allForm}
                    onDelete={openDeleteModal}
                />
                {isCreateFormModalOpen && (
                    <CreateFormModal
                        formName={formName}
                        formNameError={formNameError}
                        onNameChange={(e) => setFormName(e.target.value)}
                        onCreate={createForm}
                        onClose={() => setCreateFormModalOpen(false)}
                    />
                )}
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
