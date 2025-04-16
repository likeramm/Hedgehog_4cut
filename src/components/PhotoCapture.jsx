import React, { useState, useRef, useEffect } from 'react';

function PhotoCapture({ onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameImageRef = useRef(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [photos, setPhotos] = useState([]);
  const maxPhotos = 6;

  useEffect(() => {
    // 웹캠 스트림 요청
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 에러:", error);
      }
    }
    setupCamera();
  }, []);

  // 촬영 버튼 클릭 시 실행
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 우선 비디오 프레임 캡쳐
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 프레임 이미지가 로드 안되었다면 onload 이벤트로 처리
    if (!frameImageRef.current.complete) {
      frameImageRef.current.onload = () => {
        processPhoto(canvas, context);
      };
    } else {
      processPhoto(canvas, context);
    }
  };

  // 프레임 오버레이 및 스테가노그래피 처리 후 dataURL 생성
  const processPhoto = (canvas, context) => {
    // 프레임 이미지 오버레이
    context.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height);
    // 스테가노그래피 처리 (간단하게 "Hidden Data"를 빨간색 LSB에 삽입)
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = embedDataInImage(imageData, "Hidden Data");
    context.putImageData(imageData, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    // 배열에 추가
    setPhotos(prev => {
      const newPhotos = [...prev, dataURL];
      if (newPhotos.length === maxPhotos) {
        // 6장이 모이면 부모 컴포넌트에 전달
        onComplete(newPhotos);
      }
      return newPhotos;
    });
    setPhotoCount(prev => prev + 1);
  };

  // 간단한 스테가노그래피: 문자열의 각 비트를 빨간색 채널의 LSB에 삽입
  const embedDataInImage = (imageData, data) => {
    const binaryString = toBinaryString(data);
    const pixels = imageData.data;
    let dataIndex = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (dataIndex < binaryString.length) {
        pixels[i] = (pixels[i] & 0xFE) | parseInt(binaryString[dataIndex]);
        dataIndex++;
      } else {
        break;
      }
    }
    return imageData;
  };

  const toBinaryString = (text) => {
    return text
      .split('')
      .map((char) => {
        const binaryChar = char.charCodeAt(0).toString(2);
        return binaryChar.padStart(8, '0');
      })
      .join('');
  };

  return (
    <div className="photo-capture">
      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '600px' }} />
      </div>
      <button onClick={capturePhoto} disabled={photoCount >= maxPhotos}>
        사진 촬영 ({photoCount}/{maxPhotos})
      </button>
      {/* 내부 처리용 캔버스 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* 프레임 이미지 (public 폴더의 frame.png) */}
      <img ref={frameImageRef} src="/frame.png" alt="Frame Overlay" style={{ display: 'none' }} />
      <div className="thumbnail-container">
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`Thumbnail ${index + 1}`} style={{ width: '100px', margin: '5px' }} />
        ))}
      </div>
    </div>
  );
}

export default PhotoCapture;
