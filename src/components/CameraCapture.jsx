import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameImageRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  // 스테가노그래피에 삽입할 비밀 메시지 (원하는 내용으로 변경 가능)
  const secretMessage = "Hidden Data";

  useEffect(() => {
    // 컴포넌트 마운트 시 웹캠 스트림 요청
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

    // 컴포넌트 언마운트 시 스트림 정리
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

    // 비디오의 크기를 기준으로 캔버스 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 현재 비디오 프레임 캡쳐
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 프레임 이미지 로드가 완료되지 않았다면 onload 이벤트 설정
    if (!frameImageRef.current.complete) {
      frameImageRef.current.onload = () => {
        combineFrameAndProcess();
      };
    } else {
      combineFrameAndProcess();
    }

    function combineFrameAndProcess() {
      // 사전에 준비한 프레임 이미지 오버레이
      context.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height);
      
      // 스테가노그래피 처리: 이미지 데이터에 secretMessage 삽입
      let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      imageData = embedDataInImage(imageData, secretMessage);
      context.putImageData(imageData, 0, 0);

      // 최종 이미지를 data URL로 생성 후 부모 컴포넌트로 전달
      const dataURL = canvas.toDataURL('image/png');
      onCapture(dataURL);
    }
  };

  // 단순히 문자열을 이미지의 빨간색 채널 LSB에 삽입하는 스테가노그래피 함수 (예시)
  const embedDataInImage = (imageData, data) => {
    const binaryString = toBinaryString(data);
    const pixels = imageData.data;
    let dataIndex = 0;
    // 각 픽셀의 빨간색 채널에 대해 LSB를 데이터 비트로 변경
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
    <div className="camera-capture">
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '600px' }}
        ></video>
      </div>
      <button onClick={handleCapture}>사진 촬영</button>
      {/* 캔버스는 내부 처리용으로 숨김 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* 프레임 이미지 (public 폴더의 frame.png 등) */}
      <img
        ref={frameImageRef}
        src="/frame.png"
        alt="Frame Overlay"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default CameraCapture;
