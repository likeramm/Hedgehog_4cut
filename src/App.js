import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameImageRef = useRef(null); // 프레임 이미지 레퍼런스
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [stream, setStream] = useState(null);
  // 스테가노그래피에 삽입할 비밀 메시지
  const [secretMessage, setSecretMessage] = useState("Hidden Data");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 카메라 스트림 요청
    async function getCameraStream() {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
        setStream(localStream);
      } catch (error) {
        console.error("카메라 접근 에러:", error);
      }
    }
    getCameraStream();

    // 언마운트 시 스트림 정리
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // 비디오 크기를 기준으로 캔버스 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 현재 비디오 프레임을 캔버스에 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 프레임 이미지가 로드되어 있지 않으면 onload 이벤트 설정
    if (!frameImageRef.current.complete) {
      frameImageRef.current.onload = () => {
        combineFrameAndProcess();
      };
    } else {
      combineFrameAndProcess();
    }

    function combineFrameAndProcess() {
      // 프레임 이미지 오버레이 (필요한 경우 위치와 사이즈 조절)
      context.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height);

      // 스테가노그래피 처리: 캔버스 이미지 데이터에 secretMessage 삽입
      let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      imageData = embedDataInImage(imageData, secretMessage);
      context.putImageData(imageData, 0, 0);

      // 최종 이미지를 data URL로 생성
      const dataURL = canvas.toDataURL('image/png');
      setFinalImageUrl(dataURL);
      setShowQR(true);
    }
  };

  // 단순히 문자열을 이미지의 빨간색 채널 LSB에 삽입하는 스테가노그래피 함수 (Naive)
  const embedDataInImage = (imageData, data) => {
    const binaryString = toBinaryString(data);
    const pixels = imageData.data;
    let dataIndex = 0;
    // 전체 픽셀의 빨간색 채널에 데이터를 순차적으로 삽입 (4바이트 단위: R, G, B, A 중 R만 사용)
    for (let i = 0; i < pixels.length; i += 4) {
      if (dataIndex < binaryString.length) {
        // 현재 픽셀의 빨간색 채널 LSB를 변경
        pixels[i] = (pixels[i] & 0xFE) | parseInt(binaryString[dataIndex]);
        dataIndex++;
      } else {
        break;
      }
    }
    return imageData;
  };

  // 문자열을 이진 문자열로 변환 (문자당 8비트)
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
    <div className="App">
      <h1>인생네컷 스테가노그래피 웹앱</h1>
      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '600px' }} />
      </div>
      <button onClick={handleCapture}>사진 촬영</button>
      {/* 캔버스는 내부 처리용으로 숨김 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* 프레임 이미지 (public 폴더의 frame.png 등) */}
      <img ref={frameImageRef} src="/frame.png" alt="Frame Overlay" style={{ display: 'none' }} />

      {finalImageUrl && (
        <div className="result">
          <h2>최종 이미지</h2>
          <img src={finalImageUrl} alt="Captured with Frame and Steganography" style={{ width: '100%', maxWidth: '600px' }} />
          {showQR && (
            <div className="qr-section">
              <h3>QR 코드 다운로드</h3>
              {/* QR 코드에 최종 이미지의 data URL을 인코딩 */}
              <QRCode value={finalImageUrl} size={256} />
              <p>QR 코드를 스캔하여 이미지를 다운로드하세요!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
