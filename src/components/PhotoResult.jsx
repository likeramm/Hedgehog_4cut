// src/components/PhotoResult.js
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function PhotoResult({ photos }) {
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const frameImageRef = useRef(null);

  useEffect(() => {
    // 로컬 프레임 이미지 불러오기
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

  // Photoshop 효과(밝기, 대비, 채도 조정)를 포함하여 프레임 및 스테가노그래피 처리 진행
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
        // 필터 초기화
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

  // 간단한 스테가노그래피 함수: 이미지의 빨간색 채널 LSB에 문자열 데이터 삽입
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
      {/* 대표 미리보기 영역 : 처리된 사진 중 첫 번째 사진을 큰 사이즈로 표시 */}
      {processedPhotos.length > 0 ? (
        <div className="final-preview">
          <img
            src={processedPhotos[0]}
            alt="Final Preview"
            style={{ width: '100%', maxWidth: '600px', marginBottom: '20px' }}
          />
          <p>이 사진은 선택된 사진 중 대표 미리보기입니다.</p>
        </div>
      ) : (
        <p>사진 처리 중입니다... 잠시만 기다려 주세요.</p>
      )}
      <div className="result-grid">
        {processedPhotos.map((photo, index) => (
          <div key={index} className="result-item" style={{ margin: '10px' }}>
            <img
              src={photo}
              alt={`Processed ${index + 1}`}
              style={{ width: '150px', marginBottom: '5px' }}
            />
            <div style={{ border: '1px solid #ccc', padding: '5px' }}>
              {/* QRCodeCanvas에 data URL을 전달하면 QR 코드가 생성됩니다. */}
              <QRCodeCanvas value={photo} size={128} />
            </div>
          </div>
        ))}
      </div>
      <p>QR 코드를 스캔하면 해당 사진을 다운로드할 수 있습니다!</p>
    </div>
  );
}

export default PhotoResult;
