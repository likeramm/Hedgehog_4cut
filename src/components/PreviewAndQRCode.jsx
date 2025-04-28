import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PreviewAndQRCode = ({ selectedPhotos }) => {
  const canvasRef = useRef(null);
  const [finalImageURL, setFinalImageURL] = useState('');
  const [uploadedURL, setUploadedURL] = useState('');

  const imgbbAPIKey = '12d36b9a759404b3cebed257e0088a2e'; // 여기 본인 API 키 입력
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!canvas || selectedPhotos.length !== 4) return;
  
    canvas.width = 620;
    canvas.height = 920;
  
    const drawImages = async () => {
      const rows = 2;
      const cols = 2;
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;
  
      // 1. 사진 4장 먼저 2x2로 그리기
      for (let i = 0; i < selectedPhotos.length; i++) {
        const img = new Image();
        img.src = selectedPhotos[i];
        await new Promise((resolve) => {
          img.onload = () => {
            const x = (i % cols) * cellWidth;
            const y = Math.floor(i / cols) * cellHeight;
            ctx.drawImage(img, x, y, cellWidth, cellHeight);
            resolve();
          };
        });
      }
  
      // 2. 그 다음 프레임 덮어쓰기
      const frameImage = new Image();
      frameImage.src = '/frame.png';
      await new Promise((resolve) => {
        frameImage.onload = () => {
          ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
          resolve();
        };
      });
  
      setFinalImageURL(canvas.toDataURL('image/png'));
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
          <div style={{ marginTop: '20px' }}>
          <QRCodeCanvas value={finalImageURL} size={200} />
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
