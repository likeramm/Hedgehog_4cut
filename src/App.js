import React, { useState } from 'react';
import PhotoCapture from './components/PhotoCapture';
import PhotoSelector from './components/PhotoSelector';
import PhotoResult from './components/PhotoResult';
import './App.css';

function App() {
  // 단계: 'capture' → 'selection' → 'result'
  const [stage, setStage] = useState('capture');
  const [rawPhotos, setRawPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // PhotoCapture 완료 시 원본 사진 배열을 받아 'selection' 단계로 이동
  const handleCaptureComplete = (photos) => {
    setRawPhotos(photos);
    setStage('selection');
  };

  // PhotoSelector 완료 시 선택한 사진을 받아 'result' 단계로 이동
  const handleSelectionComplete = (photos) => {
    setSelectedPhotos(photos);
    setStage('result');
  };

  return (
    <div className="App">
      <h1>인생네컷 스테가노그래피 웹앱</h1>
      {stage === 'capture' && <PhotoCapture onComplete={handleCaptureComplete} />}
      {stage === 'selection' && <PhotoSelector photos={rawPhotos} onSelectionComplete={handleSelectionComplete} />}
      {stage === 'result' && <PhotoResult photos={selectedPhotos} />}
    </div>
  );
}

export default App;
