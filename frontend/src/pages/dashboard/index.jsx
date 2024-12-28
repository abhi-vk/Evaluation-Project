import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import { userDashboardApi } from "../../services/User";
import styles from "./dashboard.module.css";

import { createFolderApi, fetchAllFolderApi, deleteFolderApi } from "../../services/Folder";
import { fetchAllFormApi, deleteFormApi } from "../../services/Form";

import FolderButton from '../../components/folderButton';
import FormCard from '../../components/formCard';
import CreateFolderModal from '../../components/folderModal';
import DeleteModal from '../../components/deleteModal';

function Dashboard() {
  const token = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({});
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [allFolder, setAllFolder] = useState([]);
  const [allForm, setAllForm] = useState([]);

  const [folderId, setFolderId] = useState(null);
  const [formId, setFormId] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderNameError, setFolderNameError] = useState('');

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isDataFetched, setIsDataFetched] = useState(false); // New state to track fetching status
  const [entityType, setEntityType] = useState(null); // Add state for entityType

  const openCreateModal = () => {
    setFolderName('');
    setFolderNameError('');
    setCreateModalOpen(true);
    setDeleteModalOpen(false);
  };

  const openDeleteModal = (id, type = "folder") => {
    setEntityType(type);
    setFormId(null);
    setFolderId(null);
    if (type === "form") setFormId(id);
    else setFolderId(id);
    setDeleteModalOpen(true);
    setCreateModalOpen(false);
  };

  const createFolder = async () => {
    setFolderNameError('');
    if (folderName.trim().length === 0) {
      setFolderNameError('Enter folder name');
      return;
    }
    const data = await createFolderApi(folderName, token);
    if (data) {
      setCreateModalOpen(false);
      fetchAllFolder(); 
    }
  };

  const fetchAllFolder = async () => {
    const data = await fetchAllFolderApi(token);
    if (data) setAllFolder(data);
  };

  const fetchAllForm = async () => {
    const data = await fetchAllFormApi(token);
    console.log(data); 
  
    if (data) {
      
      setAllForm(data.filter((form) => !form.folderId)); 
    }
  };

  const deleteFolder = async () => {
    const data = await deleteFolderApi(folderId, token);
    if (data) {
      setDeleteModalOpen(false);
      fetchAllFolder(); // Refetch folders after deleting
    }
  };

  const deleteForm = async () => {
    try {
      const data = await deleteFormApi(formId); // Pass only formId to the API

      if (data) {
        // Update the state directly to remove the deleted form
        setAllForm((prevForms) => prevForms.filter((form) => form._id !== formId));

        // Close the delete modal
        setDeleteModalOpen(false);
      } else {
        console.log('Form deletion failed');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const userDashboard = async () => {
    try {
      const data = await userDashboardApi(token);
      if (data) {
        setUserData(data);
        fetchAllFolder();
        fetchAllForm();
        setIsDataFetched(true); // Mark data as fetched
      }
    } catch (error) {
      console.error("Error fetching user dashboard:", error);
    }
  };

  useEffect(() => {
    if (token && !isDataFetched) {
      userDashboard();
    }
  }, [token, isDataFetched]);

  return (
    <main className={styles.dashboard}>
      <div className={styles.navbar}>
        <div
          className={`${styles.dropdown} ${isDropdownOpen ? styles.show : ""}`}
        >
          <button
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <span>
              {userData.username
                ? `${userData.username}'s Workspaces`
                : "Workspaces"}
            </span>
            <img
              className={styles.arrowDown}
              src="/icons/arrow-angle-down.png"
              alt="arrow-down icon"
            />
          </button>
          <div className={styles.dropdownContent}>
            {userData?.workspaces?.length > 0 ? (
              userData.workspaces
                .filter(
                  (workspace) => workspace.name !== userData.username
                )
                .map((workspace) => (
                  <div key={workspace._id} className={styles.workspaceItem}>
                    <span>{workspace.name}</span>
                  </div>
                ))
            ) : (
              <span className={styles.noWorkspace}>No workspaces found</span>
            )}
            <Link to="/settings">Settings</Link>
            <button onClick={handleLogout} className={styles.logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.folders}>
          <button className={styles.createOpen} onClick={openCreateModal}>
            <img src="/icons/folder-create.png" alt="folder icon" />
            <span>Create a folder</span>
          </button>
          <FolderButton
            folders={allFolder}
            onDelete={(id) => openDeleteModal(id, "folder")}
          />
        </div>
        <div className={styles.forms}>
          <Link to="/workspace" className={styles.card}>
            <img src="/icons/plus.png" alt="plus icon" />
            <span>Create a typebot</span>
          </Link>
          <FormCard
            forms={allForm}
            onDelete={(id) => openDeleteModal(id, "form")}
          />
          {isCreateModalOpen && (
            <CreateFolderModal
              folderName={folderName}
              folderNameError={folderNameError}
              onNameChange={(e) => setFolderName(e.target.value)}
              onCreate={createFolder}
              onClose={() => setCreateModalOpen(false)}
            />
          )}
          {isDeleteModalOpen && (
            <DeleteModal
              entityType={entityType}
              onDelete={entityType === "folder" ? deleteFolder : deleteForm}
              onClose={() => setDeleteModalOpen(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
