import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [fileHash, setFileHash] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('File uploaded successfully');
        setDownloadLink(`http://localhost:3001/download/${result.filename}`);
        setFileHash(result.fileHash);
      } else {
        setUploadStatus('File upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('An error occurred during upload');
    }
  };

  return (
    <div className="App">
      <h1>File Upload and Download</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>
      {downloadLink && (
        <a href={downloadLink} download>
          Download File
        </a>
      )}
      {fileHash && (
        <div>
          <h2>File Hash (SHA-256):</h2>
          <p>{fileHash}</p>
        </div>
      )}
    </div>
  );
}

export default App;