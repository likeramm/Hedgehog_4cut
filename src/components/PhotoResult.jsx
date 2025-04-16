import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function PhotoResult({ photos }) {
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const frameImageRef = useRef(null);

  useEffect(() => {
    const frameImage = new Image();
    frameImage.src = '/frame.png';
    frameImage.onload = () => {
      processAllPhotos(frameImage);
    };
  }, [photos]);

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
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        context.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = embedDataInImage(imageData, "Hidden Data");
        context.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
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
