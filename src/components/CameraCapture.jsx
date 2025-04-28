import React, { useState, useRef } from 'react';

const CameraCapture = ({ onPhotosCaptured }) => {
  const videoRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('카메라를 사용할 수 없습니다: ' + err.message);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !isVideoReady) {
      alert('카메라가 아직 준비되지 않았습니다.');
      return;
    }
    if (photos.length >= 6) {
      alert('6장까지 촬영할 수 있습니다.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    setPhotos([...photos, image]);
  };

  const finishCapture = () => {
    if (photos.length !== 6) {
      alert('6장을 모두 촬영해야 합니다!');
      return;
    }
    onPhotosCaptured(photos);
  };

  return (
    <div className="camera-capture">
      {!isCameraOn ? (
        <button onClick={() => { setIsCameraOn(true); startCamera(); }}>
          카메라 시작
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            width="240"
            height="320"
            onLoadedMetadata={() => setIsVideoReady(true)}
          />
          <div>
            <button onClick={takePhoto}>사진 찍기 ({photos.length}/6)</button>
            <button onClick={finishCapture} disabled={photos.length !== 6}>
              완료
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
