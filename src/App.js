import React, { useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Assuming you have custom styles in App.css
import { ReactComponent as UploadIcon } from './UploadIcon.svg'; // Import the SVG as a React component
import axios from 'axios';

const App = () => {
  const fileInputRef = useRef();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
          'Authorization': '8c3e375b481f23e44ad6e4b3340c0fb346f10d1439ebac4ce493b94efd71e9e4',
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
      const response = await axios.post('http://0.0.0.0:8000/api/v1/scan', encodedData, {
        headers: {
          'Authorization': '8c3e375b481f23e44ad6e4b3340c0fb346f10d1439ebac4ce493b94efd71e9e4',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('Available apps:', response.data);
      setApps(response.data.apks || []);
      
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
          <ul>
            {apps.map((app, index) => (
              <li key={index}>
                {app.APP_NAME} ({app.VERSION_NAME}) - {app.PACKAGE_NAME}
              </li>
            ))}
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
    </Container>
  );
};

export default App;
