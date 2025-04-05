import React, { useState } from 'react';
import axios from 'axios';

function CreateFolder({ userId, onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/folders', {
        name: folderName,
        userId: userId, // Pass the userId
      });
      setMessage('Folder created successfully!');
      setFolderName(''); // Clear the input
      onFolderCreated(); // Call the callback function!
    } catch (error) {
      setMessage('Error creating folder.');
      console.error('Error creating folder:', error);
    }
  };

  return (
    <div>
      <h2>Create New Folder</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          required
        />
        <button type="submit">Create Folder</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateFolder;