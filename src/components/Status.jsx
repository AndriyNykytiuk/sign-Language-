import React from 'react';

// Success / error message shown above admin forms
const Status = ({ status }) => {
    if (!status) return null;
    const style = status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    return <div className={`${style} p-3 rounded mb-4`}>{status.text}</div>;
};

export default Status;
