import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { shareFormApi, countFormHitApi, saveFormResponseApi } from "../../services/Form";
import { AdminContent } from '../../components';
import { UserContent } from '../../components';
import cstyles from './chatbox.module.css';
import styles from './sharedForm.module.css';

function SharedForm() {
    const { wid } = useParams();
    const vid = Math.floor(10000 + Math.random() * 90000);
    const startDate = moment().format('MMM DD, hh:mm A');

    const [formData, setFormData] = useState({});
    const [formSequence, setFormSequence] = useState([]);
    const [formResponse, setFormResponse] = useState({ vid, startDate });

    const [activeRating, setActiveRating] = useState('');
    const [hitFlag, setHitFlag] = useState(true);
    const [shareBox, setShareBox] = useState([]);
    const [shareBoxIndex, setShareBoxIndex] = useState(0);
    const [disableFlagArr, setDisableFlagArr] = useState([]);

    // Fetch form data by ID
    const fetchFormById = async () => {
        const data = await shareFormApi(wid);
        if (data) {
            setFormData(data);
            setFormSequence(data.formSequence);
        }
    };

  
    const getInputValue = (key, value) => {
        setFormResponse((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    
    const handleButtonClick = (key) => {
        setFormResponse((prevData) => ({
            ...prevData,
            [key]: 'submitted',
        }));

        
        setIsSubmit(key); 
    };

    // Handle the form submission for each step (including button clicks)
    const setIsSubmit = async (key, e) => {
        e && e.preventDefault();
        if (!key.includes("Button") && !(key in formResponse)) return; // Skip if the button isn't relevant to the current form

       
        await saveFormResponseApi(wid, formResponse); // Save response
        console.log(formResponse);

        setDisableFlagArr((prevArray) => {
            const newArray = [...prevArray];
            newArray[shareBoxIndex] = true; // Disable current button
            return newArray;
        });

        const n = formSequence.length;
        let idx = shareBoxIndex;
        const newItems = [];

        // Move to the next question in the sequence
        while (idx + 1 < n) {
            idx += 1;
            newItems.push(formSequence[idx]);
            if (formSequence[idx].data.role === 'user') {
                break; // Stop when we reach a user input step
            }
        }

        setShareBox((prev) => [...prev, ...newItems]);
        setShareBoxIndex(idx); // Update index to the next question
    };

    useEffect(() => {
        // Initialize the sequence with admin steps first
        const adminItems = [];
        const n = formSequence.length;
        let idx = -1;

        for (let i = 0; i < n; i++) {
            if (formSequence[i].data.role === 'admin') {
                adminItems.push(formSequence[i]);
            } else {
                adminItems.push(formSequence[i]);
                idx = i;
                break; // Stop at the first user input step
            }
        }

        const boolArr = new Array(n).fill(false); // Disable all buttons initially
        setDisableFlagArr(boolArr);
        setShareBox(adminItems);
        setShareBoxIndex(idx);
    }, [formSequence]);

    useEffect(() => {
        if (wid) fetchFormById();
        const fromHit = async () => {
            if (hitFlag) {
                await countFormHitApi(wid); // Increment form hit count
                setHitFlag(false);
            }
        };

        fromHit();
    }, [wid]);

    return (
        <section className={styles.shareLayout} style={{ background: formData.formTheme }}>
            {shareBox.length > 0 && (
                <div className={`${styles.chatbox} ${cstyles.chatbox}`}>
                    {shareBox.map((item, index) => (
                        <div key={item.key + index} className={cstyles[item.data.role]}>
                            {item.data.role === 'admin' ? (
                                <>
                                    <img className={cstyles.chatHead} src="/images/vectors/chat-head.png" alt="admin chat-head" />
                                    <div className={cstyles.chat}>
                                        <span><AdminContent item={item} /></span>
                                    </div>
                                </>
                            ) : (
                                <div className={cstyles.chat}>
                                    <UserContent
                                        item={item}
                                        index={index}
                                        getInputValue={getInputValue}
                                        handleButtonClick={handleButtonClick} 
                                        setIsSubmit={setIsSubmit}
                                        disableFlagArr={disableFlagArr}
                                        activeRating={activeRating}
                                        setActiveRating={setActiveRating}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default SharedForm;
