import React, { useState } from 'react';

function PhotoSelector({ photos, onSelectionComplete }) {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const maxSelect = 4;

  const toggleSelect = (index) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        if (prev.length < maxSelect) {
          return [...prev, index];
        } else {
          alert(`최대 ${maxSelect}장만 선택할 수 있습니다.`);
          return prev;
        }
      }
    });
  };

  const confirmSelection = () => {
    if (selectedIndices.length !== maxSelect) {
      alert(`총 ${maxSelect}장을 선택해야 합니다.`);
      return;
    }
    const selectedPhotos = selectedIndices.map(i => photos[i]);
    onSelectionComplete(selectedPhotos);
  };

  return (
    <div className="photo-selector">
      <h2>6장의 사진 중에서 4장을 선택해주세요.</h2>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`photo-item ${selectedIndices.includes(index) ? 'selected' : ''}`}
            onClick={() => toggleSelect(index)}
          >
            <img src={photo} alt={`Photo ${index + 1}`} style={{ width: '150px', margin: '5px' }} />
          </div>
        ))}
      </div>
      <button onClick={confirmSelection} disabled={selectedIndices.length !== maxSelect}>
        선택 완료
      </button>
    </div>
  );
}

export default PhotoSelector;
