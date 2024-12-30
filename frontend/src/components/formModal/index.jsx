import React from 'react';
import styles from './formModal.module.css';

function CreateFormModal({ formName, formNameError, onNameChange, onCreate, onClose }) {
    return (
        <div className={styles.createFormModal}>
            <span>Create New Form</span>
            <form>
                <div className={styles.inputs}>
                    <input
                        type="text"
                        className={formNameError ? 'error' : ''}
                        value={formName}
                        onChange={onNameChange}
                        placeholder="Enter form name"
                    />
                    <label className="error">{formNameError}</label>
                </div>
                <div className={styles.action}>
                    <span className={styles.confirm} onClick={onCreate}>Create</span>
                    <span></span>
                    <span className={styles.cancel} onClick={onClose}>Cancel</span>
                </div>
            </form>
        </div>
    );
}

export default CreateFormModal;
