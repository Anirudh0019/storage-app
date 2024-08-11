import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeContract, storeHashOnBlockchain, getHashFromBlockchain, getAllFilenamesFromBlockchain } from './blockchain';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allHashes, setAllHashes] = useState({});

  useEffect(() => {
    initializeContract().catch(console.error);
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }

    setIsLoading(true);
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
        await storeHashOnBlockchain(result.filename, result.fileHash);
        setUploadStatus('File uploaded and hash stored on blockchain');
      } else {
        setUploadStatus('File upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('An error occurred during upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHash = async () => {
    const fileName = prompt('Enter the filename to retrieve its hash:');
    if (fileName) {
      setIsLoading(true);
      try {
        const hash = await getHashFromBlockchain(fileName);
        alert(`Hash for ${fileName}: ${hash}`);
      } catch (error) {
        console.error('Error retrieving hash:', error);
        alert(`Error retrieving hash: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadStatus('');
    setDownloadLink('');
    setFileHash('');
  };

  const viewAllHashes = async () => {
    setIsLoading(true);
    try {
      const filenames = await getAllFilenamesFromBlockchain();
      const hashes = {};
      for (let filename of filenames) {
        hashes[filename] = await getHashFromBlockchain(filename);
      }
      setAllHashes(hashes);
    } catch (error) {
      console.error('Error retrieving all hashes:', error);
      alert('Error retrieving all hashes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>File Upload and Download</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isLoading}>Upload</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleGetHash} disabled={isLoading}>Get Hash from Blockchain</button>
      <button onClick={viewAllHashes} disabled={isLoading}>View All Hashes</button>
      {isLoading && (
        <div className="loader-container">
          <div className="loader"></div>
          <span className="loader-text">Loading...</span>
        </div>
      )}
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
      {Object.entries(allHashes).length > 0 && (
        <div>
          <h2>All Stored Hashes:</h2>
          {Object.entries(allHashes).map(([filename, hash]) => (
            <div key={filename}>
              <strong>{filename}:</strong> {hash}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;