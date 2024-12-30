import React, { useState, useEffect } from "react";
import useAuth from "../../auth/useAuth";
import { userDashboardApi } from "../../services/User";
import { useParams, useLocation } from "react-router-dom"; // Import hooks
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

import DashboardNavbar from "../../components/dashboardNavbar"; // Importing Navbar
import FolderButton from "../../components/folderButton";
import FormCard from "../../components/formCard";
import CreateFolderModal from "../../components/folderModal";
import DeleteModal from "../../components/deleteModal";
import CreateFormModal from "../../components/formModal";
import { toast } from "react-toastify"; // Import toast for notifications

function Dashboard() {
  const token = useAuth();
  const { workspaceId } = useParams(); // Get workspaceId from URL
  const location = useLocation(); // Use to get query parameters
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
  const [currentWorkspace, setCurrentWorkspace] = useState(null); // Added to track the current workspace

  // Extract query params (e.g., 'permission')
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

  // Function to create folder
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
        setAllFolder((prevFolders) => [
          ...prevFolders,
          { _id: data._id, name: folderName },
        ]);
        toast.success("Folder created successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
        toast.error("You do not have permission to create folders.");
      } else {
        toast.error("You do not have permission to delete forms.");
      }
    }
  };

  // Function to create form
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
        toast.error("You do not have permission to delete forms.");
      }
    }
  };

  // Fetch all folders
  const fetchAllFolder = async () => {
    try {
      const data = await fetchAllFolderApi(token);
      if (data) setAllFolder(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch all forms
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

  // Function to delete folder
  const deleteFolder = async () => {
    if (!folderId) return;
    try {
      const data = await deleteFolderApi(folderId, token);
      if (data) {
        setDeleteModalOpen(false);
        fetchAllFolder();
        toast.success("Folder deleted successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
        toast.error("You do not have permission to delete folders.");
      } else {
        toast.error("You do not have permission to delete forms.");
      }
    }
  };

  // Function to delete form
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
      if (error.response && error.response.status === 403) {
        toast.error("You do not have permission to delete forms.");
      } else {
        toast.error("You do not have permission to delete forms.");
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  // Fetch user dashboard data
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

  // Handle workspace switch
  const handleWorkspaceSwitch = (workspace) => {
    setCurrentWorkspace(workspace);
    // Fetch folder and form data for the selected workspace
    fetchAllFolder();
    fetchAllForm();
  };

  useEffect(() => {
    if (token && !isDataFetched) {
      userDashboard();
    }
  }, [token, isDataFetched]);

  useEffect(() => {
    if (workspaceId) {
      // Handle workspace switching and other logic when workspaceId is available
      console.log("Workspace ID from URL:", workspaceId);
      console.log("Permission from URL:", permission);
      // You can perform any necessary actions like fetching data based on the workspaceId here
    }
  }, [workspaceId, permission]);

  return (
    <main className={styles.dashboard}>
      <DashboardNavbar
        userData={userData}
        handleLogout={handleLogout}
        isDropdownOpen={isDropdownOpen}
        setDropdownOpen={setDropdownOpen}
        onWorkspaceSwitch={handleWorkspaceSwitch} // Pass workspace switch handler
      />

      <div className={styles.section}>
        <div className={styles.folders}>
          {/* Disable folder creation if permission is 'view' */}
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
          {/* Disable form creation if permission is 'view' */}
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
