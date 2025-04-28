import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios'; // 추가 설치 필요: npm install axios

const PreviewAndQRCode = ({ selectedPhotos }) => {
  const canvasRef = useRef(null);
  const [finalImageURL, setFinalImageURL] = useState('');
  const [uploadedURL, setUploadedURL] = useState('');

  const imgbbAPIKey = 'ddd'; // 여기 본인 API 키 입력

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frameWidth = 1280;
    const frameHeight = 720;
    const margin = 10;

    if (!canvas || selectedPhotos.length !== 4) return;

    canvas.width = frameWidth;
    canvas.height = frameHeight * 4 + margin * 5;

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // 중요! CORS 문제 방지
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
      });
    };

    const drawImages = async () => {
      try {
        const images = await Promise.all(selectedPhotos.map(loadImage));

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        images.forEach((img, index) => {
          const photoWidth = frameWidth * 0.8;
          const photoHeight = frameHeight * 0.8;
          const x = (canvas.width - photoWidth) / 2;
          const y = margin * (index + 1) + frameHeight * index + ((frameHeight - photoHeight) / 2);
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
        });

        const dataURL = canvas.toDataURL('image/png');
        setFinalImageURL(dataURL);

        // 👇 여기서 imgbb에 업로드
        const formData = new FormData();
        formData.append('image', dataURL.split(',')[1]);

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, formData);
        console.log('imgbb 업로드 결과:', response.data);

        setUploadedURL(response.data.data.url); // 업로드된 짧은 URL 저장
      } catch (err) {
        console.error('이미지 처리 실패', err);
      }
    };

    drawImages();
  }, [selectedPhotos]);

  return (
    <div className="preview-qrcode">
      <h3>최종 미리보기</h3>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      {finalImageURL && (
        <>
          <img src={finalImageURL} alt="4컷 사진" style={{ width: '240px', height: 'auto' }} />
          <div style={{ marginTop: '20px' }}>
            <a href={finalImageURL} download="4cut_photo.png">
              <button>다운로드</button>
            </a>
          </div>
        </>
      )}
      {uploadedURL && (
        <div style={{ marginTop: '20px' }}>
          <h4>QR 코드로 다운로드:</h4>
          <QRCodeCanvas value={uploadedURL} size={200} />
        </div>
      )}
    </div>
  );
};

export default PreviewAndQRCode;
