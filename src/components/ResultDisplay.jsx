import React, { useState } from 'react';
import QRCode from 'qrcode.react';

function ResultDisplay({ imageUrl }) {
  const [showQR] = useState(true);

  return (
    <div className="result">
      <h2>최종 이미지</h2>
      <img
        src={imageUrl}
        alt="Captured with Frame and Steganography"
        style={{ width: '100%', maxWidth: '600px' }}
      />
      {showQR && (
        <div className="qr-section">
          <h3>QR 코드 다운로드</h3>
          {/* QR 코드에 최종 이미지의 data URL 인코딩 */}
          <QRCode value={imageUrl} size={256} />
          <p>QR 코드를 스캔하여 이미지를 다운로드하세요!</p>
        </div>
      )}
    </div>
  );
}

export default ResultDisplay;
