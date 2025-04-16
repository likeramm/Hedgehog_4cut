import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function PhotoResult({ photos }) {
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const frameImageRef = useRef(null);

  useEffect(() => {
    // 프레임 이미지 생성 (off-screen)
    const frameImage = new Image();
    frameImage.src = '/frame.png';
    frameImage.onload = () => {
      processAllPhotos(frameImage);
    };
  }, [photos]);

  // 선택된 각 사진을 처리
  const processAllPhotos = (frameImage) => {
    const promises = photos.map(photo => processPhoto(photo, frameImage));
    Promise.all(promises).then(results => {
      setProcessedPhotos(results);
    });
  };

  const processPhoto = (photoDataURL, frameImage) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = photoDataURL;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        // 원본 사진 그리기
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // 프레임 오버레이
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        // 스테가노그래피 처리
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = embedDataInImage(imageData, "Hidden Data");
        context.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
    });
  };

  // 간단한 스테가노그래피 함수 (빨간색 LSB에 데이터 삽입)
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
      <h2>최종 선택된 사진</h2>
      <div className="result-grid">
        {processedPhotos.map((photo, index) => (
          <div key={index} className="result-item">
            <img src={photo} alt={`Processed ${index + 1}`} style={{ width: '150px', margin: '5px' }} />
            <QRCodeCanvas value={photo} size={128} />
          </div>
        ))}
      </div>
      <p>QR 코드를 스캔하여 사진을 다운로드하세요!</p>
    </div>
  );
}

export default PhotoResult;
