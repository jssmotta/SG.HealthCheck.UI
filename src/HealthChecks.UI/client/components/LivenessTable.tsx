import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Liveness } from '../typings/models';
import { discoveryServices, getStatusConfig } from '../healthChecksResources';
import { CheckTable } from './CheckTable';

function rowKey(item: Liveness, index: number): string {
  return `${index}-${item.name}`;
}

interface LivenessTableProps {
  livenessData: Array<Liveness>;
}

const LivenessTable: FunctionComponent<LivenessTableProps> = ({ livenessData }) => {
  /** true = detail section visible */
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const mapTable = (livenessData: Array<Liveness>): Array<Liveness> => {
    return livenessData.map(liveness => {
      if (liveness.livenessResult) {
        let checks;
        try {
          checks = JSON.parse(liveness.livenessResult).checks;
          Object.assign(liveness, { checks });
        } catch (err) {
          Object.assign(liveness, { checks: liveness.livenessResult });
        }
      }
      return liveness;
    });
  };

  const rows = useMemo(() => mapTable(livenessData), [livenessData]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    rows.forEach((item, i) => {
      next[rowKey(item, i)] = false;
    });
    setExpandedRows(next);
  }, [rows]);

  const allExpanded = useMemo(() => {
    if (rows.length === 0) return false;
    return rows.every((item, i) => expandedRows[rowKey(item, i)] === true);
  }, [rows, expandedRows]);

  const toggleAll = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setExpandedRows(prev => {
      const next = { ...prev };
      rows.forEach((item, i) => {
        const k = rowKey(item, i);
        next[k] = !allExpanded;
      });
      return next;
    });
  };

  const toggleRow = (key: string) => {
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <table className="hc-table">
      <thead className="hc-table__head">
        <tr>
          <th>
            <button
              type="button"
              title={allExpanded ? 'close all' : 'expand all'}
              onClick={toggleAll}>
              <i className="material-icons js-toggle-all">
                {allExpanded ? 'remove_circle_outline' : 'add_circle_outline'}
              </i>
            </button>
          </th>
          <th>Name</th>
          <th>Health</th>
          <th>On state from</th>
          <th>Last execution</th>
        </tr>
      </thead>
      <tbody className="hc-table__body">
        {rows.map((item, index) => {
          const statusConfig = getStatusConfig(item.status);
          const key = rowKey(item, index);
          const expanded = expandedRows[key] === true;
          return (
            <React.Fragment key={key}>
              <tr
                className="hc-table__row"
                onClick={() => toggleRow(key)}>
                <td className="align-center">
                  <i
                    className="material-icons js-toggle-event"
                    title={expanded ? 'hide info' : 'expand info'}>
                    {expanded ? 'remove' : 'add'}
                  </i>
                </td>
                <td>
                  {getDiscoveryServiceImage(item.discoveryService)}
                  {item.name}
                </td>
                <td className="align-center">
                  <i
                    className="material-icons"
                    style={{
                      paddingRight: '0.5rem',
                      color: `var(${statusConfig!.color})`
                    }}>
                    {statusConfig!.image}
                  </i>
                </td>
                <td className="align-center">
                  {item.status} {moment.utc(item.onStateFrom).fromNow().toString()}
                </td>
                <td className="align-center">
                  {new Date(item.lastExecuted).toLocaleString()}
                </td>
              </tr>
              <tr
                className={
                  expanded
                    ? 'hc-checks-table-container'
                    : 'hc-checks-table-container hc-details-row--collapsed'
                }>
                <td colSpan={5}>
                  <CheckTable checks={item.entries} history={item.history} />
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

const getDiscoveryServiceImage = (discoveryService: string) => {
  if (discoveryService != null) {
    let discoveryServiceImage = discoveryServices.find(
      ds => ds.name === discoveryService
    )!.image;
    return (
      <img
        className="discovery-icon"
        src={discoveryServiceImage}
        title="Kubernetes discovered liveness"
      />
    );
  }

  return null;
};

export { LivenessTable };
