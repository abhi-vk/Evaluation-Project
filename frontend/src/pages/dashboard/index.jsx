import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import { userDashboardApi } from "../../services/User";
import styles from "./dashboard.module.css";

import {
  createFolderApi,
  fetchAllFolderApi,
  deleteFolderApi,
} from "../../services/Folder";
import {
  fetchAllFormApi,
  deleteFormApi,
  createFormApi,
} from "../../services/Form";

import FolderButton from "../../components/folderButton";
import FormCard from "../../components/formCard";
import CreateFolderModal from "../../components/folderModal";
import DeleteModal from "../../components/deleteModal";
import CreateFormModal from "../../components/formModal";

function Dashboard() {
  const token = useAuth();

  const [userData, setUserData] = useState({});
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [allFolder, setAllFolder] = useState([]);
  const [allForm, setAllForm] = useState([]);

  const [folderId, setFolderId] = useState(null);
  const [formId, setFormId] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folderNameError, setFolderNameError] = useState("");
  const [formName, setFormName] = useState("");
  const [formNameError, setFormNameError] = useState("");

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isCreateFormModalOpen, setCreateFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isDataFetched, setIsDataFetched] = useState(false);
  const [entityType, setEntityType] = useState(null);

  const openCreateModal = () => {
    setFolderName("");
    setFolderNameError("");
    setCreateModalOpen(true);
    setDeleteModalOpen(false);
  };

  const openCreateFormModal = () => {
    setFormName("");
    setFormNameError("");
    setCreateFormModalOpen(true);
  };

  const openDeleteModal = (id, type = "folder") => {
    setEntityType(type);
    setFolderId(null);
    setFormId(null);

    if (type === "folder") {
      setFolderId(id);
    } else if (type === "form") {
      setFormId(id);
    }

    setDeleteModalOpen(true);
    setCreateModalOpen(false);
  };

  const createFolder = async () => {
    setFolderNameError("");
    if (folderName.trim().length === 0) {
      setFolderNameError("Enter folder name");
      return;
    }

    try {
      const data = await createFolderApi(folderName, token);
      if (data) {
        setCreateModalOpen(false);
        // Immediately update the folder list after creation
        setAllFolder((prevFolders) => [
          ...prevFolders,
          { _id: data._id, name: folderName },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createForm = async () => {
    setFormNameError("");
    if (formName.trim().length === 0) {
      setFormNameError("Enter form name");
      return;
    }

    try {
      const data = await createFormApi(null, formName);
      if (data) {
        // After creating the form, fetch the updated list of forms
        fetchAllForm();  // This ensures you are working with the most up-to-date form data
        setFormName("");
        setCreateFormModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllFolder = async () => {
    try {
      const data = await fetchAllFolderApi(token);
      if (data) setAllFolder(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllForm = async () => {
    try {
      const data = await fetchAllFormApi(token);
      if (data) {
        setAllForm(data.filter((form) => !form.folderId)); // This filters out forms with a folderId
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFolder = async () => {
    if (!folderId) return;
    try {
      const data = await deleteFolderApi(folderId, token);
      if (data) {
        setDeleteModalOpen(false);
        // Refresh the folder list after deletion
        fetchAllFolder();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteForm = async () => {
    if (!formId) return;
    try {
      const data = await deleteFormApi(formId);
      if (data) {
        setAllForm((prevForms) => prevForms.filter((form) => form._id !== formId));
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const userDashboard = async () => {
    try {
      const data = await userDashboardApi(token);
      if (data) {
        setUserData(data);
        fetchAllFolder();
        fetchAllForm();
        setIsDataFetched(true);
      }
    } catch (error) {
      console.error(error);
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
              userData.workspaces.map((workspace) => (
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
          <button className={styles.card} onClick={openCreateFormModal}>
            <img src="/icons/plus.png" alt="plus icon" />
            <span>Create a typebot</span>
          </button>
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
