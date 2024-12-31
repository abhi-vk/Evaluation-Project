import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../auth/useAuth";
import { fetchFormByIdApi, updateFormApi } from "../../services/Form";

import { WorkspaceNavbar } from "../../components";
import { FormBox } from "../../components";

import styles from "./workspace.module.css";

function Workspace() {
  const token = useAuth();
  const [searchParams] = useSearchParams();
  const [formId, setFormId] = useState(searchParams.get("wid"));
  const [formBox, setFormBox] = useState([]);
  const [formBoxError, setFormBoxError] = useState({});
  const [clickCounts, setClickCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasFetchedRef = useRef(false); // Ref to track fetch status

  const adminButtons = [
    {
      role: "admin",
      src: "chat.png",
      type: "Text",
      hint: "Click here to edit",
      value: "",
    },
    {
      role: "admin",
      src: "photo.png",
      type: "Image",
      hint: "Click to add link",
      value: "",
    },
    {
      role: "admin",
      src: "video.png",
      type: "Video",
      hint: "Click to add link",
      value: "",
    },
    {
      role: "admin",
      src: "gif.png",
      type: "GIF",
      hint: "Click to add link",
      value: "",
    },
  ];

  const userButtons = [
    {
      role: "user",
      src: "text.png",
      type: "Text",
      hint: "Input text on this form",
    },
    {
      role: "user",
      src: "hash.png",
      type: "Number",
      hint: "Input a number on this form",
    },
    {
      role: "user",
      src: "at.png",
      type: "Email",
      hint: "Input an email on this form",
    },
    {
      role: "user",
      src: "call.png",
      type: "Phone",
      hint: "Input a phone on this form",
    },
    { role: "user", src: "calendar.png", type: "Date", hint: "Select a date" },
    {
      role: "user",
      src: "star.png",
      type: "Rating",
      hint: "Tap to rate out of 5",
    },
    {
      role: "user",
      src: "checkbox.png",
      type: "Button",
      hint: "Click to add button text",
      value: "",
    },
  ];

  // Add a new box to the form sequence
  const handleAddBox = (data) => {
    if (!formId) {
      toast.error(
        "Enter form name and hit save and comeback to this page again"
      );
      return;
    }
    const key = `${data.role}-${data.type}`;
    const newCount = (clickCounts[key] || 0) + 1;
    setClickCounts((prevCounts) => ({ ...prevCounts, [key]: newCount }));

    setFormBox([...formBox, { key: key + ":" + newCount, data }]);

    // Handle button click state
    if (data.type === "Button") {
      setFormBox((prevFormBox) => {
        const updatedFormBox = [...prevFormBox];
        updatedFormBox[updatedFormBox.length - 1].data.value = "submit";
        return updatedFormBox;
      });
    }
  };

  // Remove a box from the form sequence
  const handleRemoveBox = (index) => {
    const updatedFormBox = formBox.filter((_, i) => i !== index);
    setFormBox(updatedFormBox);
  };

  // Update the value of a form box
  const getFormBoxValue = (index, value) => {
    setFormBox((prevFormBox) => {
      const updatedFormBox = [...prevFormBox];
      updatedFormBox[index] = {
        ...updatedFormBox[index],
        data: { ...updatedFormBox[index].data, value },
      };
      return updatedFormBox;
    });

    // Error handling for form input
    setFormBoxError((prevErrors) => ({
      ...prevErrors,
      [index]: value === "" ? "Required Field" : null,
    }));
  };

  // Fetch form data by ID
  const fetchFormById = useCallback(async () => {
    if (!formId || hasFetchedRef.current || isLoading) return; // Prevent re-fetching if already fetched or loading

    setIsLoading(true);
    setErrorMessage("");
    console.log("Fetching form data for ID:", formId);

    try {
      const data = await fetchFormByIdApi(formId, token);
      if (data) {
        setFormBox(data.formSequence);
        hasFetchedRef.current = true; // Mark fetch as complete
        console.log("Form data fetched successfully:", data);
      } else {
        setErrorMessage("Failed to fetch form data. Please try again later.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setErrorMessage("API Error: Failed to fetch form data.");
    } finally {
      setIsLoading(false);
    }
  }, [formId, token, isLoading]); // Make sure `isLoading` is included to prevent conflicts

  // Update the form sequence
  const updateFormSequence = async () => {
    let error = false;
    const newErrors = {};

    formBox.forEach((element, index) => {
      const { role, type, value } = element.data;

      // Button validation: consider 'clicked' value as valid for Button type
      if (role === "admin" || (role === "user" && type === "Button")) {
        if (!value || value === "Submit") {
          error = true;
          newErrors[index] = "Required Field";
        }
      }
    });

    setFormBoxError(newErrors);

    if (!error) {
      try {
        const data = await updateFormApi(
          formId,
          { formSequence: formBox },
          token
        );
        if (data) {
          toast.success("Form updated successfully.");
          hasFetchedRef.current = false; 
        }
      } catch (err) {
        toast.error("Error updating form.");
      }
    }
  };

  useEffect(() => {
    if (formId && token && !hasFetchedRef.current) {
      fetchFormById();
    }
  }, [formId, token]);

  return (
    <main className={styles.workspace}>
      <WorkspaceNavbar
        setWorkspaceId={setFormId}
        updateFormSequence={updateFormSequence}
      />
      <div className={styles.space}>
        <div className={styles.sidebar}>
          <span>Bubbles</span>
          <div className={styles.bubbles}>
            {adminButtons.map((button, index) => (
              <button key={index} onClick={() => handleAddBox(button)}>
                <img src={`/icons/${button.src}`} alt={`${button.type} icon`} />
                {button.type}
              </button>
            ))}
          </div>
          <span>Inputs</span>
          <div className={styles.inputs}>
            {userButtons.map((button, index) => (
              <button key={index} onClick={() => handleAddBox(button)}>
                <img src={`/icons/${button.src}`} alt={`${button.type} icon`} />
                {button.type}
              </button>
            ))}
          </div>
          <span className={styles.note}>
            <strong>Note:</strong>
            <ul>
              <li>
                Always place the button at the end of the form sequence if you
                choose to include one. Premature submission can lead to
                incomplete submissions.
              </li>
              <li>
                If no button is required, the form will function as intended
                without one.
              </li>
            </ul>
          </span>
        </div>
        <div className={styles.layout}>
          <div className={styles.card}>
            <div className={styles.start}>
              <img src="/icons/flag.png" alt="Start icon" />
              <span className={styles.title}>Start</span>
            </div>
          </div>
          {formBox.map((box, index) => (
            <FormBox
              key={box.key}
              button={box}
              index={index}
              handleRemoveBox={handleRemoveBox}
              getFormBoxValue={getFormBoxValue}
              formBoxError={formBoxError}
            />
          ))}
          <div className={styles.endCard}></div>
        </div>
      </div>
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    </main>
  );
}

export default Workspace;
