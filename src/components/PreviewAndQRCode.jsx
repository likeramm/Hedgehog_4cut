import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PreviewAndQRCode = ({ selectedPhotos }) => {
  const canvasRef = useRef(null);
  const [finalImageURL, setFinalImageURL] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frameWidth = 480;
    const frameHeight = 640;
    const margin = 10;

    // 캔버스 크기는 프레임 배경 크기에 맞춰야 해!
    canvas.width = frameWidth;
    canvas.height = frameHeight * 4 + margin * 5;

    const drawImages = async () => {
      // 1. 프레임 이미지 먼저 그리기
      const frameImage = new Image();
      frameImage.src = '/frame.png'; // public 안에 frame.png
      await new Promise((resolve) => {
        frameImage.onload = () => {
          ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
          resolve();
        };
      });

      // 2. 선택된 사진들 그리기
      for (let i = 0; i < selectedPhotos.length; i++) {
        const img = new Image();
        img.src = selectedPhotos[i];
        await new Promise((resolve) => {
          img.onload = () => {
            // 프레임의 사진 위치에 맞춰서 조정해서 그려야 예쁨!
            const photoWidth = frameWidth * 0.8;  // 사진 크기 조정
            const photoHeight = frameHeight * 0.8;
            const x = (canvas.width - photoWidth) / 2; // 가운데 정렬
            const y = margin * (i + 1) + (frameHeight * i) + ((frameHeight - photoHeight) / 2);
            ctx.drawImage(img, x, y, photoWidth, photoHeight);
            resolve();
          };
        });
      }

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
    </div>
  );
};

export default PreviewAndQRCode;
