import React, { useState, useEffect } from 'react';
import { UIApiSettings } from '../typings/models';
import { LivenessTable } from '../components/LivenessTable';
import { useQuery } from 'react-query';
import { getHealthChecks } from '../api/fetchers';
import { LivenessMenu } from '../components/LivenessMenu';
import { AlertPanel } from '../components/AlertPanel';

interface LivenessProps {
    apiSettings: UIApiSettings;
}

const LivenessPage: React.FunctionComponent<LivenessProps> = ({ apiSettings }) => {

    const [fetchInterval, setFetchInterval] = useState<number | false>(apiSettings.pollingInterval * 1000);
    const [running, setRunning] = useState<boolean>(true);
    
    const { data: livenessData, isError } = useQuery("healthchecks", getHealthChecks,
        { refetchInterval: fetchInterval, keepPreviousData: true, retry: 1 });

    useEffect(() => {
        console.log(`Configured polling interval: ${fetchInterval} milliseconds`);
    }, []);

    useEffect(() => {
        if (!running) {
            setFetchInterval(false);
            return;
        }
        setFetchInterval(apiSettings.pollingInterval * 1000);
    }, [running]);

    return (
        <article className="hc-liveness">
            <header className="hc-liveness__header">
                <h1>{apiSettings.headerText}</h1>
                <LivenessMenu
                    pollingInterval={apiSettings.pollingInterval}
                    running={running}
                    onRunningClick={() => setRunning(!running)} />
            </header>
            {isError ? (
                <AlertPanel message="Could not retrieve health checks data" />
            ) : null}
            <div className="hc-liveness__container">
                <div className="hc-table-container">
                    {livenessData !== undefined ? (
                        <LivenessTable livenessData={livenessData!} />
                    ) : null}
                </div>
            </div>
        </article>
    );

};

export { LivenessPage };
