import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // 최신버전에서는 이렇게 { }로

const PreviewAndQRCode = ({ selectedPhotos }) => {
  const canvasRef = useRef(null);
  const [finalImageURL, setFinalImageURL] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frameWidth = 480;
    const frameHeight = 640;
    const margin = 10;

    if (!canvas || selectedPhotos.length !== 4) return;

    canvas.width = frameWidth;
    canvas.height = frameHeight * 4 + margin * 5;

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
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

        setFinalImageURL(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('이미지 로딩 실패', err);
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
          <div style={{ marginTop: '20px' }}>
            <QRCodeCanvas value={finalImageURL} size={200} /> {/* 여기 QRCodeCanvas 사용 */}
          </div>
        </>
      )}
    </div>
  );
};

export default PreviewAndQRCode;
