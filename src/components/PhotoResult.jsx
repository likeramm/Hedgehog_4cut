import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function PhotoResult({ photos }) {
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const frameImageRef = useRef(null);

  useEffect(() => {
    const frameImage = new Image();
    frameImage.src = '/frame.png';
    frameImage.onload = () => {
      console.log("PhotoResult - 프레임 이미지 로드 완료");
      processAllPhotos(frameImage);
    };
    frameImage.onerror = () => {
      console.error("PhotoResult - 프레임 이미지 로드 실패");
    };
  }, [photos]);

  const processAllPhotos = (frameImage) => {
    const promises = photos.map(photo => processPhoto(photo, frameImage));
    Promise.all(promises)
      .then(results => {
        console.log("PhotoResult - 모든 사진 처리 완료:", results);
        setProcessedPhotos(results);
      })
      .catch((err) => {
        console.error("PhotoResult - 사진 처리 중 오류 발생:", err);
      });
  };

  // "포토샵" 효과를 위해 캔버스 filter를 적용한 후, 프레임과 스테가노그래피 처리
  const processPhoto = (photoDataURL, frameImage) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = photoDataURL;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        // Photoshop 효과: 밝기, 대비, 채도 약간 조정
        context.filter = 'brightness(1.1) contrast(1.2) saturate(1.1)';
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // 필터 적용 후 다시 원래 상태로 복원
        context.filter = 'none';
        // 프레임 오버레이
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        // 스테가노그래피 처리
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = embedDataInImage(imageData, "Hidden Data");
        context.putImageData(imageData, 0, 0);
        const processedDataURL = canvas.toDataURL('image/png');
        console.log("Processed photo:", processedDataURL.slice(0, 50) + "...");
        resolve(processedDataURL);
      };
      img.onerror = (e) => {
        console.error("processPhoto - 이미지 로드 실패", e);
        reject(e);
      };
    });
  };

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
    <div className="photo-result">
      <h2>최종 선택된 사진 미리보기</h2>
      {/* 완성된 사진 미리보기 (큰 사이즈) */}
      {processedPhotos.length > 0 && (
        <div className="preview">
          <img src={processedPhotos[0]} alt="Final Preview" style={{ width: '100%', maxWidth: '600px', marginBottom: '20px' }} />
        </div>
      )}
      <div className="result-grid">
        {processedPhotos.length === 0 && (
          <p>사진 처리 중입니다... 잠시만 기다려 주세요.</p>
        )}
        {processedPhotos.map((photo, index) => (
          <div key={index} className="result-item" style={{ margin: '10px' }}>
            <img src={photo} alt={`Processed ${index + 1}`} style={{ width: '150px', marginBottom: '5px' }} />
            <div style={{ border: '1px solid #ccc', padding: '5px' }}>
              <QRCodeCanvas value={photo} size={128} />
            </div>
          </div>
        ))}
      </div>
      <p>QR 코드를 스캔하여 사진을 다운로드하세요!</p>
    </div>
  );
}

export default PhotoResult;
