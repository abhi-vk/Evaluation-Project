import React from "react";
import { Link } from "react-router-dom";
import styles from "./dashboardnavbar.module.css";

function DashboardNavbar({
  userData,
  isDropdownOpen,
  setDropdownOpen,
  handleLogout,
}) {
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
          {userData?.workspaces?.length > 1 ? (
            userData.workspaces.slice(1).map((workspace) => (
              <div key={workspace._id} className={styles.workspaceItem}>
                <span>{workspace.name}'s workspace</span>
              </div>
            ))
          ) : (
            <span className={styles.noWorkspace}>No invites</span>
          )}
          <Link to="/settings">Settings</Link>
          <button onClick={handleLogout} className={styles.logout}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.remainingContainer}>
        {/* Light/Dark Mode Toggle */}
        <div className={styles.toggleContainer}>
          <span>Light</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              onChange={() => {
                // This will be implemented later
              }}
            />
            <span className={styles.slider}></span>
          </label>
          <span>Dark</span>
        </div>

        {/* Share Button */}
        <button className={styles.shareButton}>Share</button>
      </div>
    </div>
  );
}

export default DashboardNavbar;
