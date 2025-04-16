import React, { useState, useRef, useEffect } from 'react';

function PhotoCapture({ onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameImageRef = useRef(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [photos, setPhotos] = useState([]);
  const maxPhotos = 6;

  useEffect(() => {
    async function setupCamera() {
      try {
        console.log("카메라 스트림 요청 중...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("카메라 스트림 성공:", stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 에러:", error);
        alert("카메라 접근 에러: " + error.message);
      }
    }
    setupCamera();
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // 비디오가 준비되지 않았다면 중단
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("비디오가 아직 준비되지 않았습니다.");
      alert("비디오가 아직 준비되지 않았습니다. 잠시 후 다시 시도하세요.");
      return;
    }
    
    // 캔버스 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 현재 비디오 프레임 캡쳐
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 프레임 이미지 로드 확인
    if (!frameImageRef.current.complete) {
      console.warn("프레임 이미지가 아직 로드되지 않았습니다.");
      frameImageRef.current.onload = () => processPhoto(canvas, context);
    } else {
      processPhoto(canvas, context);
    }
  };

  // 프레임 오버레이 및 스테가노그래피 처리 후 dataURL 생성
  const processPhoto = (canvas, context) => {
    // 프레임 이미지 오버레이
    context.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height);
    
    // 단순 스테가노그래피 처리 ("Hidden Data" 삽입)
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = embedDataInImage(imageData, "Hidden Data");
    context.putImageData(imageData, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    console.log("사진 캡쳐 완료:", dataURL);
    
    setPhotos(prev => {
      const newPhotos = [...prev, dataURL];
      console.log(`현재 사진 개수: ${newPhotos.length}/${maxPhotos}`);
      if (newPhotos.length === maxPhotos) {
        console.log("6장 모두 촬영 완료. 다음 단계로 이동합니다.");
        onComplete(newPhotos);
      }
      return newPhotos;
    });
    setPhotoCount(prev => prev + 1);
  };

  // 문자열을 이진 문자열로 변환 후 빨간색 채널 LSB에 삽입 (간단한 스테가노그래피)
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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          onLoadedMetadata={() => {
            console.log("비디오 메타데이터 로드 완료:", videoRef.current.videoWidth, videoRef.current.videoHeight);
          }}
          style={{ width: '100%', maxWidth: '600px' }}
        />
      </div>
      <button onClick={capturePhoto} disabled={photoCount >= maxPhotos}>
        사진 촬영 ({photoCount}/{maxPhotos})
      </button>
      {/* 내부 처리용 캔버스 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* 프레임 이미지 (public/frame.png) */}
      <img
        ref={frameImageRef}
        src="/frame.png"
        alt="Frame Overlay"
        onLoad={() => console.log("프레임 이미지 로드 완료")}
        style={{ display: 'none' }}
      />
      <div className="thumbnail-container">
        {photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Thumbnail ${index + 1}`}
            style={{ width: '100px', margin: '5px' }}
          />
        ))}
      </div>
    </div>
  );
}

export default PhotoCapture;
