import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // 꼭 {} 중괄호로 가져와야 함

const PreviewAndQRCode = ({ selectedPhotos }) => {
  const canvasRef = useRef(null);
  const [finalImageURL, setFinalImageURL] = useState('');
  const [uploadedURL, setUploadedURL] = useState('');

  const imgbbAPIKey = '12d36b9a759404b3cebed257e0088a2e'; // 본인 imgbb API Key 입력

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!canvas || selectedPhotos.length !== 4) {
      console.warn('사진이 4개가 아닙니다.', selectedPhotos);
      return;
    }

    canvas.width = 620; // 프레임에 맞춤
    canvas.height = 920;

    const drawImages = async () => {
      console.log('선택된 사진들:', selectedPhotos);

      const rows = 2;
      const cols = 2;
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      // 1. 사진 4장 먼저 그리고
      for (let i = 0; i < selectedPhotos.length; i++) {
        const img = new Image();
        img.src = selectedPhotos[i];
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const x = (i % cols) * cellWidth;
            const y = Math.floor(i / cols) * cellHeight;
            ctx.drawImage(img, x, y, cellWidth, cellHeight);
            resolve();
          };
          img.onerror = (e) => {
            console.error('사진 로딩 실패:', e);
            reject(e);
          };
        });
      }

      // 2. 마지막에 프레임 덮어씌우기
      const frameImage = new Image();
      frameImage.src = '/frame.png'; // public 폴더 기준
      await new Promise((resolve, reject) => {
        frameImage.onload = () => {
          ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        frameImage.onerror = (e) => {
          console.error('프레임 이미지 로딩 실패:', e);
          reject(e);
        };
      });

      // 3. 캔버스 저장
      setFinalImageURL(canvas.toDataURL('image/png'));
    };

    drawImages();
  }, [selectedPhotos]);

  // imgbb 업로드 함수
  const uploadToImgBB = async () => {
    if (!finalImageURL) {
      alert('먼저 미리보기를 생성해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', finalImageURL.split(',')[1]);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadedURL(data.data.url);
      } else {
        alert('업로드 실패');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="preview-qrcode">
      <h2>최종 미리보기</h2>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {finalImageURL && (
        <>
          <img src={finalImageURL} alt="4컷 미리보기" style={{ width: '240px', height: 'auto', margin: '20px 0' }} />

          <div>
            <a href={finalImageURL} download="4cut_photo.png">
              <button>다운로드</button>
            </a>
            <button onClick={uploadToImgBB} style={{ marginLeft: '10px' }}>
              업로드 후 QR 생성
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>미리보기 QR 코드:</h4>
            <QRCodeCanvas value={finalImageURL} size={200} />
          </div>
        </>
      )}

      {uploadedURL && (
        <div style={{ marginTop: '40px' }}>
          <h4>업로드된 이미지 QR 코드:</h4>
          <QRCodeCanvas value={uploadedURL} size={200} />
        </div>
      )}
    </div>
  );
};

export default PreviewAndQRCode;