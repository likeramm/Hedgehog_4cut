import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import PhotoSelection from './components/PhotoSelection';
import PreviewAndQRCode from './components/PreviewAndQRCode';
import './styles.css';

const App = () => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const handlePhotosCaptured = (photos) => {
    setPhotos(photos);
    setStep(2);
  };

  const handleSelectionComplete = (selected) => {
    setSelectedPhotos(selected);
    setStep(3);
  };

  return (
    <div className="app">
      <h1>4컷 사진 촬영기 🎞️</h1>
      {step === 1 && <CameraCapture onPhotosCaptured={handlePhotosCaptured} />}
      {step === 2 && <PhotoSelection photos={photos} onSelectionComplete={handleSelectionComplete} />}
      {step === 3 && <PreviewAndQRCode selectedPhotos={selectedPhotos} />}
    </div>
  );
};

export default App;
