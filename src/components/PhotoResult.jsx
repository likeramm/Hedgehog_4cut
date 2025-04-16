import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function PhotoResult({ photos }) {
  const [processedPhotos, setProcessedPhotos] = useState([]);

  useEffect(() => {
    const frameImage = new Image();
    frameImage.src = '/frame.png';
    frameImage.onload = () => {
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
        setProcessedPhotos(results);
      })
      .catch((err) => {
        console.error("PhotoResult - 사진 처리 중 오류 발생:", err);
      });
  };

  // Photoshop 효과: 밝기, 대비, 채도, 색조, 드롭 섀도우 효과 적용 후
  // 프레임 오버레이와 스테가노그래피 처리
  const processPhoto = (photoDataURL, frameImage) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // CORS 문제 해결을 위해
      img.src = photoDataURL;
      img.onload = () => {
        if (img.width === 0 || img.height === 0) {
          return reject(new Error("이미지 크기가 0입니다."));
        }
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');

        // Photoshop 효과 적용
        context.filter = 'brightness(1.2) contrast(1.3) saturate(1.4) hue-rotate(10deg) drop-shadow(5px 5px 10px rgba(0,0,0,0.3))';
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        context.filter = 'none'; // 필터 리셋

        // 프레임 오버레이
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

        // 스테가노그래피 처리: "Hidden Data"를 빨간색 채널 LSB에 삽입
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = embedDataInImage(imageData, "Hidden Data");
        context.putImageData(imageData, 0, 0);

        const processedDataURL = canvas.toDataURL('image/png');
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
      {/* 대표 미리보기 영역 */}
      {processedPhotos.length > 0 ? (
        <div className="final-preview" style={{ marginBottom: '20px' }}>
          <img 
            src={processedPhotos[0]} 
            alt="Final Preview" 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              border: '5px solid #007bff', 
              borderRadius: '10px' 
            }} 
          />
          <p>대표 미리보기</p>
        </div>
      ) : (
        <p>사진 처리 중입니다... 잠시만 기다려 주세요.</p>
      )}
      {/* 개별 처리된 사진과 QR 코드 영역 */}
      <div 
        className="result-grid" 
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {processedPhotos.map((photo, index) => (
          <div 
            key={index} 
            className="result-item" 
            style={{ margin: '10px', textAlign: 'center' }}
          >
            <img 
              src={photo} 
              alt={`Processed ${index + 1}`} 
              style={{ 
                width: '150px', 
                border: '2px solid #007bff', 
                borderRadius: '5px' 
              }} 
            />
            <div style={{ marginTop: '5px', border: '1px solid #ccc', padding: '5px' }}>
              <QRCodeCanvas value={photo} size={128} />
            </div>
            <p>이미지 #{index + 1}</p>
          </div>
        ))}
      </div>
      <p>QR 코드를 스캔하면 해당 사진을 다운로드할 수 있습니다!</p>
    </div>
  );
}

export default PhotoResult;
