import React, { useState, useEffect } from 'react';
import API_URL from '../config';

const Search = ({ onSearchResults }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        onSearchResults(data);
                    })
                    .catch(err => console.error('Search error:', err));
            } else {
                // If query is empty, maybe we want to clear results or do nothing?
                // Let's pass null or empty array to indicate no search active
                // But the requirement says "if enter word... pull up that word".
                // If empty, we might want to let the parent decide (e.g. show lesson again).
                // For now, let's pass null to indicate "no search query".
                onSearchResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, onSearchResults]);

    return (
        <div className="w-full max-w-md">
            <input
                type="text"
                placeholder="Пошук слова..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
};

export default Search;
