import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import QRCode from "qrcode.react";

// 텍스트를 8비트 바이너리 문자열로 변환하는 헬퍼 함수
const textToBinary = (text) => {
  return text
    .split('')
    .map(char => {
      let binary = char.charCodeAt(0).toString(2);
      return "00000000".slice(binary.length) + binary;
    })
    .join('');
};

// 바이너리 문자열을 텍스트로 복원하는 헬퍼 함수
const binaryToText = (binary) => {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
};

const LifeFourCuts = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [hiddenMessage, setHiddenMessage] = useState("Hello, hidden world!");
  const [decodedMessage, setDecodedMessage] = useState("");

  // 1. 카메라로부터 사진 촬영
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  // 2. LSB 기법을 이용하여 메시지를 이미지에 삽입
  // 단순 예제: 이미지의 각 픽셀(R 채널)의 최하위 비트에 메시지의 비트를 순차적으로 삽입합니다.
  const embedMessageInImage = (imageData, message) => {
    let data = imageData.data;
    // 메시지를 바이너리로 변환 후 종료를 위한 null 문자('00000000') 덧붙임
    let messageBinary = textToBinary(message) + '00000000';
    let msgIndex = 0;
    for (let i = 0; i < data.length && msgIndex < messageBinary.length; i += 4) {
      // R 채널만 수정
      let red = data[i];
      const bit = messageBinary[msgIndex];
      // R 채널의 최하위 비트를 메시지 비트로 교체
      data[i] = (red & 0xFE) | parseInt(bit, 10);
      msgIndex++;
    }
    return imageData;
  };

  // 3. 이미지로부터 숨은 메시지 추출
  const extractMessageFromImage = (imageData) => {
    let data = imageData.data;
    let binary = '';
    // 이미지의 각 픽셀(R 채널)에서 최하위 비트를 읽음
    for (let i = 0; i < data.length; i += 4) {
      let bit = data[i] & 1;
      binary += bit.toString();
    }
    // 8비트씩 읽어 null 종료 전까지 텍스트로 변환
    let message = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substr(i, 8);
      if (byte === '00000000') break; // 종료 조건
      message += String.fromCharCode(parseInt(byte, 2));
    }
    return message;
  };

  // 4. 캡처된 이미지에 PNG 프레임 오버레이 후 스테가노그래피 삽입 처리
  const mergeAndEmbed = () => {
    if (!capturedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const photo = new Image();
    const frame = new Image();

    photo.src = capturedImage;
    // 프레임 이미지는 프로젝트의 public/assets/ 폴더 내 위치
    frame.src = "/assets/frame.png";

    photo.onload = () => {
      // 캔버스 크기를 촬영 이미지에 맞춤
      canvas.width = photo.width;
      canvas.height = photo.height;
      ctx.drawImage(photo, 0, 0, photo.width, photo.height);
      frame.onload = () => {
        // 촬영된 이미지 위에 프레임 합성
        ctx.drawImage(frame, 0, 0, photo.width, photo.height);
        // 스테가노그래피 처리: 픽셀 데이터에 메시지 삽입
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newImageData = embedMessageInImage(imageData, hiddenMessage);
        ctx.putImageData(newImageData, 0, 0);
        // 최종 합성된 이미지를 Data URL로 저장
        const resultImage = canvas.toDataURL("image/png");
        setFinalImage(resultImage);
        // 데모에서는 최종 이미지를 직접 QR코드에 사용합니다.
        setQrValue(resultImage);
      };
    };
  };

  // 5. 최종 이미지에서 숨은 메시지 해독
  const decodeMessage = () => {
    if (!finalImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = finalImage;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const msg = extractMessageFromImage(imageData);
      setDecodedMessage(msg);
    };
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <h1>인생네컷 앱 데모</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        videoConstraints={{ facingMode: "user" }}
      />
      <div style={{ margin: "1rem 0" }}>
        <button onClick={capturePhoto}>촬영</button>
      </div>

      {capturedImage && (
        <div>
          <h2>촬영된 사진</h2>
          <img src={capturedImage} alt="Captured" style={{ maxWidth: '100%' }} />
          <div style={{ margin: "1rem 0" }}>
            <button onClick={mergeAndEmbed}>
              프레임 적용 및 스테가노그래피 메시지 삽입
            </button>
          </div>
        </div>
      )}

      {finalImage && (
        <div>
          <h2>최종 이미지</h2>
          <img src={finalImage} alt="Final" style={{ maxWidth: '100%' }} />
          <div style={{ margin: "1rem 0" }}>
            <h3>사진 다운로드 QR 코드</h3>
            <QRCode value={qrValue} size={256} />
            <p>QR코드를 스캔하여 사진 다운로드 (데모용: 이미지 Data URL 사용)</p>
          </div>
          <div style={{ margin: "1rem 0" }}>
            <button onClick={decodeMessage}>숨은 메시지 해독</button>
          </div>
          {decodedMessage && (
            <div>
              <h3>해독된 메시지:</h3>
              <p>{decodedMessage}</p>
            </div>
          )}
        </div>
      )}
      {/* 이미지 합성 및 스테가노그래피 처리를 위한 Canvas (화면에 노출되지 않음) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default LifeFourCuts;
