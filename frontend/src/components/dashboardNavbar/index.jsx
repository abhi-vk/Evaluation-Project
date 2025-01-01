import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { inviteUserApi, switchWorkspaceApi, generateInviteLinkApi } from "../../services/Workspace"; // Import workspace APIs
import { toast } from "react-toastify"; // For user feedback
import styles from "./dashboardnavbar.module.css";

function DashboardNavbar({
  userData,
  isDropdownOpen,
  setDropdownOpen,
  handleLogout,
  onWorkspaceSwitch, // Callback to notify parent component of workspace switch
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [permission, setPermission] = useState("edit"); // Default permission
  const [isProcessing, setIsProcessing] = useState(false); // For button loading state
  const [currentWorkspace, setCurrentWorkspace] = useState(
    userData?.workspaces?.[0] || null // Default to the first workspace
  );
  const [inviteLink, setInviteLink] = useState(""); // State to store the invite link

  // Load the current workspace from localStorage if it exists
  useEffect(() => {
    const savedWorkspace = JSON.parse(localStorage.getItem("currentWorkspace"));
    if (savedWorkspace) {
      setCurrentWorkspace(savedWorkspace);
    }
  }, []);

  // Save the current workspace to localStorage whenever it changes
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

    setIsProcessing(true); // Disable button while processing
    try {
      const success = await inviteUserApi(inviteeEmail, permission, () => {});
      if (success) {
        toast.success("Invite sent successfully.");
        setInviteeEmail(""); // Clear the input field
        setModalOpen(false); // Close the modal
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
        setCurrentWorkspace(workspace); // Update the current workspace
        onWorkspaceSwitch(workspace); // Notify parent component of workspace switch
      }
    } catch (error) {
      console.error(error);
      toast.error("Error switching workspace.");
    }
  };

  const handleGenerateInviteLink = async () => {
    try {
      const link = await generateInviteLinkApi(() => {});
      setInviteLink(link); // Set the invite link
      toast.success("Invite link generated successfully.");
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
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Invite link copied to clipboard.");
    }).catch((err) => {
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
              onClick={() => handleSwitchWorkspace(workspace)} // Switch workspace
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
            <input type="checkbox" />
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
