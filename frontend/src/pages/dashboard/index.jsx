import React, { useState, useEffect } from "react";
import useAuth from "../../auth/useAuth";
import { userDashboardApi } from "../../services/User";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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

import DashboardNavbar from "../../components/dashboardNavbar";
import FolderButton from "../../components/folderButton";
import FormCard from "../../components/formCard";
import CreateFolderModal from "../../components/folderModal";
import DeleteModal from "../../components/deleteModal";
import CreateFormModal from "../../components/formModal";
import { toast } from "react-toastify";
import { handleWorkspaceJoinApi } from "../../services/Workspace";

function Dashboard() {
  const token = useAuth();
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // Added for navigation
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
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  const urlParams = new URLSearchParams(location.search);
  const permission = urlParams.get("permission");

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
        await fetchAllFolder();
        toast.success("Folder created successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
        toast.error("You do not have permission to create folders.");
      } else {
        toast.error("An error occurred while creating the folder.");
      }
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
        fetchAllForm();
        setFormName("");
        setCreateFormModalOpen(false);
        toast.success("Form created successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
        toast.error("You do not have permission to create forms.");
      } else {
        toast.error("An error occurred while creating the form.");
      }
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
        setAllForm(data.filter((form) => !form.folderId));
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
        setAllFolder((prevFolders) =>
          prevFolders.filter((folder) => folder._id !== folderId)
        );
        toast.success("Folder deleted successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the folder.");
    }
  };

  const deleteForm = async () => {
    if (!formId) return;
    try {
      const data = await deleteFormApi(formId);
      if (data) {
        setAllForm((prevForms) =>
          prevForms.filter((form) => form._id !== formId)
        );
        setDeleteModalOpen(false);
        toast.success("Form deleted successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the form.");
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

  const handleWorkspaceSwitch = (workspace) => {
    setCurrentWorkspace(workspace);
    fetchAllFolder();
    fetchAllForm();
  };

  const handleWorkspaceJoin = async () => {
    if (workspaceId) {
      try {
        const workspace = await handleWorkspaceJoinApi(workspaceId, navigate);
        if (workspace) {
          setCurrentWorkspace(workspace);
          fetchAllFolder();
          fetchAllForm();
        }
      } catch (error) {
        console.error("Error joining workspace:", error);
      }
    }
  };

  useEffect(() => {
    if (token && !isDataFetched) {
      userDashboard();
    }
  }, [token, isDataFetched]);

  useEffect(() => {
    if (workspaceId) {
      handleWorkspaceJoin();
    }
  }, [workspaceId]);

  return (
    <main className={styles.dashboard}>
      <DashboardNavbar
        userData={userData}
        handleLogout={handleLogout}
        isDropdownOpen={isDropdownOpen}
        setDropdownOpen={setDropdownOpen}
        onWorkspaceSwitch={handleWorkspaceSwitch}
      />

      <div className={styles.section}>
        <div className={styles.folders}>
          {permission !== "view" && (
            <button className={styles.createOpen} onClick={openCreateModal}>
              <img src="/icons/folder-create.png" alt="folder icon" />
              <span>Create a folder</span>
            </button>
          )}
          <FolderButton
            folders={allFolder}
            onDelete={(id) => permission !== "view" && openDeleteModal(id, "folder")}
          />
        </div>
        <div className={styles.forms}>
          {permission !== "view" && (
            <button className={styles.card} onClick={openCreateFormModal}>
              <img src="/icons/plus.png" alt="plus icon" />
              <span>Create a typebot</span>
            </button>
          )}
          <FormCard
            forms={allForm}
            onDelete={(id) => permission !== "view" && openDeleteModal(id, "form")}
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
