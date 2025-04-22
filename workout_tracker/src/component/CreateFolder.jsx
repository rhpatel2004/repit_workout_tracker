import React, { useState } from 'react';
import axios from 'axios';
// Remove inline style imports/definitions

function CreateFolder({ userId, onFolderCreated, onClose }) {
    const [folderName, setFolderName] = useState('');
    const [message, setMessage] = useState('');
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!folderName.trim()) {
            setMessage('Folder name cannot be empty.'); return;
        }
        try {
            const response = await axios.post(`${API_URL}/folders`, {
                name: folderName,
                userId: userId,
            });
            setMessage('Folder created successfully!'); // Success message
            setFolderName('');
            onFolderCreated();
            setTimeout(() => { onClose(); }, 1200); // Slightly longer delay
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || error.message}`); // Error message
            console.error('Error creating folder:', error);
        }
    };

    // Determine message class based on content
    const messageClass = message.startsWith('Error:') ? 'modal-message error' : 'modal-message success';

    return (
        // Use CSS classes instead of inline styles
        <div className="create-folder-backdrop" onClick={onClose}>
            <div className="create-folder-modal" onClick={e => e.stopPropagation()}>
                <h2>Create New Folder</h2>
                <form onSubmit={handleSubmit} className="modal-form">
                    <input
                        type="text"
                        placeholder="Folder Name"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        required
                        autoFocus // Focus input on open
                        className="modal-input" // Add class for specific styling if needed
                    />
                    <div className="modal-actions">
                         {/* Use general button class + specific modifier */}
                        <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
                        <button type="submit" className="button-primary">Create</button>
                    </div>
                </form>
                {/* Add class to message paragraph */}
                {message && <p className={messageClass}>{message}</p>}
            </div>
        </div>
    );
}

export default CreateFolder; 