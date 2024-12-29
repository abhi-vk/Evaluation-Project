import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import { fetchFormByIdApi } from "../../services/Form";
import { WorkspaceNavbar } from '../../components';
import { PieChart } from 'react-minimal-pie-chart';  
import styles from './response.module.css';

function Response() {
    const token = useAuth();
    const [searchParams] = useSearchParams();

    const formId = searchParams.get('wid');
    const [formStarts, setFormStarts] = useState(0);
    const [formCompletion, setFormCompletion] = useState(0);

    const [noResponse, setNoResponse] = useState(false);
    const [formData, setFormData] = useState({ formHits: 0, formSequence: [], formResponse: [] });
    const [hasFetched, setHasFetched] = useState(false); // New flag to track fetch status

    const { formHits, formSequence, formResponse } = formData;

    // Filter to get all user-related keys from formSequence
    const headers = formSequence
        .filter((data) => data.key.includes("user"))
        .map((item) => item.key);

    // Fetch form stats
    const getFromStats = useCallback(() => {
        let starts = 0,
            completes = 0;
        const seqLength = formSequence.filter((item) => item.data.role === 'user').length;

        formResponse.forEach((item) => {
            const resLength = Object.keys(item).length;
            seqLength === resLength - 2 ? completes++ : starts++; // Check if response is complete or just started
        });

        setFormStarts(starts);
        setFormCompletion(completes);
    }, [formSequence, formResponse]);

    // Fetch form data
    const fetchFormById = useCallback(async () => {
        try {
            const data = await fetchFormByIdApi(formId, token);
            setFormData(data);

            if (data.formResponse.length === 0) {
                setNoResponse(true); // No responses
            }
            setHasFetched(true); // Mark fetch as complete
        } catch (error) {
            console.error('Error fetching form:', error);
        }
    }, [formId, token]);

    useEffect(() => {
        if (token && formId && !hasFetched) {
            fetchFormById();
        }
    }, [token, formId, fetchFormById, hasFetched]);

    useEffect(() => {
        if (hasFetched && formSequence.length && formResponse.length) {
            getFromStats();
        }
    }, [hasFetched, formSequence, formResponse, getFromStats]);

    const completionPercentage = formHits ? parseInt(formCompletion / formHits * 100) : 0;

    return (
        <div className={styles.response}>
            <WorkspaceNavbar />
            {noResponse && <p className={styles.noResponse}>No response yet collected</p>}
            <section className={styles.content}>
                <div className={styles.brief}>
                    <div className={styles.card}>
                        <p>Views</p>
                        <p>{formHits}</p>
                    </div>
                    <div className={styles.card}>
                        <p>Starts</p>
                        <p>{formStarts}</p>
                    </div>
                    
                </div>
                <div className={styles.tableContainer}>
                    {formResponse.length > 0 && (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>First Interaction Time</th>
                                    {headers.map((key, index) => (
                                        <th key={`${key}-${index}`}>{key.split("-")[1].split(":").join(" ")}</th> // Ensure key is unique
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {formResponse.map((valueRow, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{valueRow.startDate}</td>
                                        {headers.map((key, idx) => (
                                            <td key={`${key}-${idx}`}>{valueRow[key]}</td> // Ensure key is unique
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pie Chart for Completion Rate */}
                <div className={styles.chartContainer}>
                <div className={styles.card}>
                        <p>Completion rate</p>
                        <p>{formHits ? parseInt(formCompletion / formHits * 100) : 0} %</p>
                    </div>
                    <PieChart className={styles.PieChartContainer}
                        data={[
                            { title: 'Completed', value: completionPercentage, color: '#3B82F6' },
                            { title: 'Remaining', value: 100 - completionPercentage, color: '#D1D5DB' }
                        ]}
                        lineWidth={30}
                        radius={20}
                        label={({ data, dataIndex }) => {
                            const value = data && data[dataIndex] ? data[dataIndex].value : 0;
                            return value > 0 ? `${value}%` : '';  // Only show percentage if it's greater than 0
                        }}
                        labelStyle={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fill: '#fff',
                            opacity: 0.75
                        }}
                    />
                </div>
            </section>
        </div>
    );
}

export default Response;
