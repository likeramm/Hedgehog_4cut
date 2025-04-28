import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // 꼭 중괄호 {} 써야함!

const PreviewAndQRCode = ({ selectedPhotos }) => {
  const canvasRef = useRef(null);
  const [finalImageURL, setFinalImageURL] = useState('');
  const [uploadedURL, setUploadedURL] = useState('');

  const imgbbAPIKey = '12d36b9a759404b3cebed257e0088a2e'; // 본인 imgbb API Key

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!canvas || selectedPhotos.length !== 4) {
      console.warn('사진이 4개가 아닙니다.', selectedPhotos);
      return;
    }

    // 1. 캔버스 사이즈 프레임에 맞게
    canvas.width = 620;
    canvas.height = 920;

    const drawImages = async () => {
      console.log('선택된 사진들:', selectedPhotos);

      const rows = 2;
      const cols = 2;
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      // 2. 사진들 먼저 2x2로 그리기
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

      // 3. 마지막에 프레임 덮어씌우기
      const frameImage = new Image();
      frameImage.src = '/frame.png'; // public 폴더 안에 반드시 존재해야 함
      await new Promise((resolve, reject) => {
        frameImage.onload = () => {
          ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        frameImage.onerror = (e) => {
          console.error('프레임 로딩 실패:', e);
          reject(e);
        };
      });

      // 4. 최종 base64 저장
      setFinalImageURL(canvas.toDataURL('image/png'));
    };

    drawImages();
  }, [selectedPhotos]);

  // imgbb에 업로드하는 함수
  const uploadToImgBB = async () => {
    if (!finalImageURL) {
      alert('미리보기를 먼저 생성해주세요.');
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
        alert('이미지 업로드 실패');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('이미지 업로드 중 오류 발생');
    }
  };

  return (
    <div className="preview-qrcode" style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>📷 최종 4컷 미리보기</h2>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {finalImageURL ? (
        <>
          <img
            src={finalImageURL}
            alt="4컷 미리보기"
            style={{ width: '300px', height: 'auto', margin: '20px 0', border: '2px solid #ccc' }}
          />

          <div style={{ marginTop: '20px' }}>
            <a href={finalImageURL} download="4cut_photo.png">
              <button>다운로드</button>
            </a>
            <button onClick={uploadToImgBB} style={{ marginLeft: '10px' }}>
              업로드 후 QR 생성
            </button>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h4>미리보기 QR 코드:</h4>
            {finalImageURL ? (
              <QRCodeCanvas value={finalImageURL} size={200} />
            ) : (
              <p>미리보기가 없습니다.</p>
            )}
          </div>
        </>
      ) : (
        <p>사진 4장을 선택하면 미리보기가 생성됩니다.</p>
      )}

      {uploadedURL && (
        <div style={{ marginTop: '40px' }}>
          <h4>업로드된 링크 QR 코드:</h4>
          {uploadedURL ? (
            <QRCodeCanvas value={uploadedURL} size={200} />
          ) : (
            <p>업로드 링크가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewAndQRCode;
