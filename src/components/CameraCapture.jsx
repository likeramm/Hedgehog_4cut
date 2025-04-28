import React, { useState, useRef, useEffect } from 'react';

const CameraCapture = ({ onPhotosCaptured }) => {
  const videoRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            aspectRatio: 16 / 9,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert('카메라를 사용할 수 없습니다: ' + err.message);
      }
    };

    if (isCameraOn) {
      startCamera();
    }
  }, [isCameraOn]);

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
    canvas.width = 1280;
    canvas.height = 720;
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
        <button onClick={() => setIsCameraOn(true)}>카메라 시작</button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="320"
            height="180"
            onLoadedMetadata={() => setIsVideoReady(true)}
            style={{ borderRadius: '12px', backgroundColor: 'black' }}
          />
          <div style={{ marginTop: '10px' }}>
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
