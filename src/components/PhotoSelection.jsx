import React, { useState } from 'react';

const PhotoSelection = ({ photos, onSelectionComplete }) => {
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const selectPhoto = (photo) => {
    if (selectedPhotos.includes(photo)) {
      alert('이미 선택한 사진입니다.');
      return;
    }
    if (selectedPhotos.length >= 4) {
      alert('4장까지 선택할 수 있습니다.');
      return;
    }
    setSelectedPhotos([...selectedPhotos, photo]);
  };

  const handleComplete = () => {
    if (selectedPhotos.length !== 4) {
      alert('4장을 선택해야 합니다.');
      return;
    }
    onSelectionComplete(selectedPhotos);
  };

  return (
    <div className="photo-selection">
      <h3>사진을 4장 선택하세요 (순서 중요)</h3>
      <div className="photo-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {photos.map((photo, index) => (
          <div
            key={index}
            onClick={() => selectPhoto(photo)}
            style={{
              width: '240px',       // ✅ 16
              height: '135px',      // ✅ 9 (16:9 비율 맞춤)
              position: 'relative',
              border: selectedPhotos.includes(photo) ? '3px solid blue' : '1px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={photo}
              alt={`촬영된 사진 ${index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // 비율 유지하며 채우기
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleComplete} disabled={selectedPhotos.length !== 4}>
          선택 완료
        </button>
      </div>
    </div>
  );
};

export default PhotoSelection;
