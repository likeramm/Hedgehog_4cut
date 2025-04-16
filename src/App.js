import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

function App() {
  const [finalImageUrl, setFinalImageUrl] = useState(null);

  // CameraCapture 컴포넌트에서 촬영 및 처리 후 data URL을 전달받음
  const handleCapture = (dataURL) => {
    setFinalImageUrl(dataURL);
  };

  return (
    <div className="App">
      <h1>인생네컷 스테가노그래피 웹앱</h1>
      <CameraCapture onCapture={handleCapture} />
      {finalImageUrl && <ResultDisplay imageUrl={finalImageUrl} />}
    </div>
  );
}

export default App;
