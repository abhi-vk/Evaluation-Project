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

    const handleButtonClick = async (key, value) => {
        const updatedResponse = {
            ...formResponse,
            [key]: value || 'submitted', 
        };
    
        setFormResponse(updatedResponse);
        await saveFormResponseApi(wid, updatedResponse);
        console.log("Button clicked data saved:", updatedResponse);
    
        setDisableFlagArr((prevArray) => {
            const newArray = [...prevArray];
            newArray[shareBoxIndex] = true;
            return newArray;
        });
    
        setIsSubmit(key);
    };

    const setIsSubmit = async (key, e) => {
        e && e.preventDefault();
    
        if (!(key in formResponse)) {
            console.warn(`Key ${key} not found in formResponse. Skipping submission.`);
            return;
        }
    
        await saveFormResponseApi(wid, formResponse);
        console.log("Form response saved:", formResponse);
    
        setDisableFlagArr((prevArray) => {
            const newArray = [...prevArray];
            newArray[shareBoxIndex] = true;
            return newArray;
        });
    
        const n = formSequence.length;
        let idx = shareBoxIndex;
        const newItems = [];
    
        while (idx + 1 < n) {
            idx += 1;
            newItems.push(formSequence[idx]);
            if (formSequence[idx].data.role === 'user') {
                break;
            }
        }
    
        setShareBox((prev) => [...prev, ...newItems]);
        setShareBoxIndex(idx);
    };

    useEffect(() => {
        const adminItems = [];
        const n = formSequence.length;
        let idx = -1;

        for (let i = 0; i < n; i++) {
            if (formSequence[i].data.role === 'admin') {
                adminItems.push(formSequence[i]);
            } else {
                adminItems.push(formSequence[i]);
                idx = i;
                break;
            }
        }

        const boolArr = new Array(n).fill(false);
        setDisableFlagArr(boolArr);
        setShareBox(adminItems);
        setShareBoxIndex(idx);
    }, [formSequence]);

    useEffect(() => {
        if (wid) fetchFormById();
        const fromHit = async () => {
            if (hitFlag) {
                await countFormHitApi(wid);
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
