import React from 'react';
import styles from './user.module.css';

function UserContent({ item, index, getInputValue, handleButtonClick, setIsSubmit, disableFlagArr, activeRating, setActiveRating }) {
    const { type, value } = item.data;

    // Handling input fields (Text, Number, Email, Phone, Date)
    if (type === 'Text' || type === 'Number' || type === 'Email' || type === 'Phone' || type === 'Date') {
        return (
            <form className={styles.inputs} onSubmit={(e) => setIsSubmit(item.key, e)}>
                <input 
                    type={type} 
                    id={item.key} 
                    onChange={(e) => getInputValue(item.key, e.target.value)} 
                    placeholder={`Enter Your ${type}`} 
                    autoComplete="off" 
                    required 
                    disabled={disableFlagArr[index]} 
                />
                <button className={styles.submitBtn} disabled={disableFlagArr[index]}>
                    <img src="/icons/send.png" alt="send icon" />
                </button>
            </form>
        );
    } 
    // Handling Rating inputs
    else if (type === 'Rating') {
        return (
            <div className={styles.inputs}>
                <div className={`${styles.rating} ${disableFlagArr[index] ? styles.disabled : ''}`}>
                    {[1, 2, 3, 4, 5].map((i, idx) => (
                        <button 
                            key={i} 
                            className={activeRating === idx ? styles.activeRating : ''} 
                            onClick={() => { 
                                getInputValue(item.key, i); 
                                setActiveRating(idx); 
                            }}>
                            {i}
                        </button>
                    ))}
                </div>
                <button className={styles.submitBtn} onClick={() => setIsSubmit(item.key)} disabled={disableFlagArr[index]}>
                    <img src="/icons/send.png" alt="send icon" />
                </button>
            </div>
        );
    } 
    // Handling Button inputs
    else if (type === 'Button') {
        return (
            <button 
                key={index} 
                className={styles.inputBtn} 
                onClick={() => handleButtonClick(item.key, value)} 
                disabled={disableFlagArr[index]}>
                {value}
            </button>
        );
    } else {
        return null; // If the type is not recognized, return null
    }
}

export default UserContent;
