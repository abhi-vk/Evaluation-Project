import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { inviteUserApi, switchWorkspaceApi, generateInviteLinkApi } from "../../services/Workspace";
import { toast } from "react-toastify";
import styles from "./dashboardnavbar.module.css";

function DashboardNavbar({
  userData,
  isDropdownOpen,
  setDropdownOpen,
  handleLogout,
  onWorkspaceSwitch,
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [permission, setPermission] = useState("edit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(
    userData?.workspaces?.[0] || null
  );
  const [inviteLink, setInviteLink] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");


  useEffect(() => {
    
  

    const savedWorkspace = JSON.parse(localStorage.getItem("currentWorkspace"));
    
    if (savedWorkspace) {
      setCurrentWorkspace(savedWorkspace); 
    } else if (userData?.workspaces?.[0]) {
      setCurrentWorkspace(userData.workspaces[0]); 
    }
  }, [userData]); 
  
  // Initialize the theme on first render
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  useEffect(() => {
    const savedWorkspace = JSON.parse(localStorage.getItem("currentWorkspace"));
    if (savedWorkspace) {
      setCurrentWorkspace(savedWorkspace);
    }
  }, []);

  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem("currentWorkspace", JSON.stringify(currentWorkspace));
    }
  }, [currentWorkspace]);

  const handleInvite = async () => {
    if (!inviteeEmail) {
      toast.error("Please enter an email address.");
      return;
    }

    setIsProcessing(true);
    try {
      const success = await inviteUserApi(inviteeEmail, permission, () => {});
      if (success) {
        toast.success("Invite sent successfully.");
        setInviteeEmail("");
        setModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invite.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchWorkspace = async (workspace) => {
    try {
      const updatedWorkspace = await switchWorkspaceApi(workspace._id, () => {});
      if (updatedWorkspace) {
        toast.success(`Switched to workspace: ${workspace.name}`);
        setCurrentWorkspace(workspace);
        onWorkspaceSwitch(workspace);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error switching workspace.");
    }
  };

  const handleGenerateInviteLink = async () => {
    try {
        const link = await generateInviteLinkApi(permission, () => {});
        setInviteLink(link);
    } catch (error) {
        console.error(error);
        toast.error("Failed to generate invite link.");
    }
};


  const handleCopyLink = () => {
    if (!inviteLink) {
      toast.error("No invite link to copy.");
      return;
    }
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast.success("Invite link copied to clipboard.");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link.");
      });
  };

  return (
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
            {currentWorkspace?.name
              ? `${currentWorkspace.name}'s workspace`
              : userData?.username
              ? `${userData.username}'s workspace`
              : "Workspaces"}
          </span>
          <img
            className={styles.arrowDown}
            src="/icons/arrow-angle-down.png"
            alt="arrow-down icon"
          />
        </button>
        <div className={styles.dropdownContent}>
          {userData?.workspaces?.map((workspace) => (
            <div
              key={workspace._id}
              className={styles.workspaceItem}
              onClick={() => handleSwitchWorkspace(workspace)}
            >
              <span>{workspace.name}'s workspace</span>
            </div>
          ))}
          <Link to="/settings">Settings</Link>
          <button onClick={handleLogout} className={styles.logout}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.remainingContainer}>
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
          className={styles.shareButton}
          onClick={() => setModalOpen(true)}
        >
          Share
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <div className={styles.modalHeader}>
              <h2>Invite by Email</h2>
              <select
                className={styles.dropdownMenu}
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="edit">Edit</option>
                <option value="view">View</option>
              </select>
            </div>
            <div className={styles.modalContent}>
              <input
                type="email"
                placeholder="Enter email id"
                className={styles.inputField}
                value={inviteeEmail}
                onChange={(e) => setInviteeEmail(e.target.value)}
              />
              <button
                className={styles.primaryButton}
                onClick={handleInvite}
                disabled={isProcessing}
              >
                {isProcessing ? "Sending..." : "Send Invite"}
              </button>

              <h2>Invite by Link</h2>
              <button
                className={styles.secondaryButton}
                onClick={handleGenerateInviteLink}
              >
                Generate Invite Link
              </button>

              {inviteLink && (
                <div className={styles.linkContainer}>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={inviteLink}
                    readOnly
                  />
                  <button
                    className={styles.secondaryButton}
                    onClick={handleCopyLink}
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardNavbar;
