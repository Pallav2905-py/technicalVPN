import React, { useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ReactComponent as UploadIcon } from './UploadIcon.svg'; // Import the SVG as a React component
import axios from 'axios';
import StaticAnalysis from './Components/StaticAnalysis';

const App = () => {
  const fileInputRef = useRef();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState()
  useEffect(() => {
    // Fetch available apps for dynamic analysis on component mount
    // scanApp();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/vnd.android.package-archive') {
        setError('Only .apk files are allowed.');
        return;
      }
      // Confirm the file upload
      const confirmUpload = window.confirm("Do you want to proceed with the file upload?");
      if (confirmUpload) {
        setFile(file);
        setError('');
        uploadFile(file);
      } else {
        // Reset file input if user cancels the upload
        event.target.value = null;
      }
    }
  };

  const uploadFile = async (file) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://0.0.0.0:8000/api/v1/upload', formData, {
        headers: {
          'Authorization': 'df3c7bb5420f8c4bbd502a49e0a1fed5670c117082da4da6fb72e2b7c6529c04',
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },

      })
      console.log(response.data.hash)
      scanApp(response.data.hash);
      setIsAnalyzing(true);

    }
    catch (error) {
      console.error('Error uploading file:', error);
    }
    //   .then((response) => {
    //     console.log('File uploaded successfully:', response.data);
    //   })
    //   .catch((error) => {
    //   });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const scanApp = async (hash) => {
    setIsAnalyzing(true);
    try {
      const hashData = new URLSearchParams();
      hashData.append('hash', hash)
      const encodedData = hashData.toString()
      const resScan = await axios.post('http://0.0.0.0:8000/api/v1/scan', encodedData, {
        headers: {
          'Authorization': 'df3c7bb5420f8c4bbd502a49e0a1fed5670c117082da4da6fb72e2b7c6529c04',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log(resScan.data)
      setResponse(resScan)
      // console.log('Available apps:', response.data);
      setApps(resScan.data.activities || []);
      console.log(resScan.data.activities);
      // console.log(response.version)

    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    }
    setIsAnalyzing(false);

  };


  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file.type !== 'application/vnd.android.package-archive') {
      setError('Only .apk files are allowed.');
      return;
    }
    const confirmUpload = window.confirm("Do you want to proceed with the file upload?");
    if (confirmUpload) {
      setFile(file);
      setError('');
      uploadFile(file);
    }
  };

  return (
    <Container fluid className="bg-dark text-white vh-100 d-flex flex-column justify-content-center align-items-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Row className="text-center mb-4">
        <Col>
          <Button
            variant="light"
            className="mb-3"
            style={{ cursor: 'pointer' }}
            onClick={triggerFileInput}
          >
            <UploadIcon className="mr-2" />
            Upload & Analyze
          </Button>
          <p>Drag & Drop anywhere!</p>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".apk"
            onChange={handleFileUpload}
          />
        </Col>
      </Row>
      {error && (
        <Row className="text-center mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}
      {(uploadProgress > 0 || isAnalyzing) && (
        <Row className="text-center mb-4">
          <Col>
            <p>{uploadProgress < 100 ? `${uploadProgress}% Uploaded...` : 'Analyzing...'}</p>
            <ProgressBar now={uploadProgress} animated />
          </Col>
        </Row>
      )}
      <Row className="w-50">
        <Col>
          <Form.Control type="text" placeholder="Download & Scan Package" className="text-center" />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h4>Available Apps for Dynamic Analysis</h4>
            <li>Title {response && response.data.title}</li>
          <ul><label>Activities</label>
            {apps.map((app, index) => (
              <li key={index}>
                {app}
              </li>
            ))}
            <li><b>Version</b> {response && response.data.version}</li>
            <li><b>sha1</b> {response && response.data.sha1}</li>
            <li><b>sha256</b> {response && response.data.sha256}</li>
            <li><b>Size</b> {response && response.data.size}</li>
          </ul>
        </Col>
      </Row>
      {/* <footer className="mt-auto text-center">
        <a href="#" className="text-white mx-2">RECENT SCANS</a> |
        <a href="#" className="text-white mx-2">DYNAMIC ANALYZER</a> |
        <a href="#" className="text-white mx-2">API</a> |
        <a href="#" className="text-white mx-2">DONATE</a> |
        <a href="#" className="text-white mx-2">DOCS</a> |
        <a href="#" className="text-white mx-2">ABOUT</a>
        <p className="mt-3">© 2024 Mobile Security Framework - MobSF v4.0.2</p>
      </footer> */}
      {/* {response && <StaticAnalysis data={response.data}></StaticAnalysis>} */}
    </Container>

  );
};

export default App;
