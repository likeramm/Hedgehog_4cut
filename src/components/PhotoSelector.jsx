import React, { useState } from 'react';
import SelectionFlowchart from './SelectionFlowchart';

function PhotoSelector({ photos, onSelectionComplete }) {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const maxSelect = 4;

  // 선택된 사진 배열 (실시간 미리보기용)
  const selectedPhotos = selectedIndices.map(i => photos[i]);

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
    onSelectionComplete(selectedPhotos);
  };

  return (
    <div className="photo-selector">
      <h2>6장의 사진 중 4장을 선택해주세요.</h2>
      {/* 선택 프로세스 순서도 */}
      <SelectionFlowchart />
      <div 
        className="selector-container" 
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
      >
        {/* 왼쪽: 전체 썸네일 영역 (번호 표시 포함) */}
        <div className="thumbnail-grid" style={{ flex: 1, paddingRight: '20px' }}>
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`photo-item ${selectedIndices.includes(index) ? 'selected' : ''}`}
              onClick={() => toggleSelect(index)}
              style={{ position: 'relative', display: 'inline-block', margin: '10px', cursor: 'pointer' }}
            >
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`} 
                style={{ 
                  width: '150px', 
                  border: selectedIndices.includes(index) ? '3px solid #007bff' : '1px solid #ccc',
                  borderRadius: '5px'
                }} 
              />
              {/* 선택된 경우 오버레이 번호 표시 */}
              {selectedIndices.includes(index) && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  background: '#007bff',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  textAlign: 'center',
                  lineHeight: '24px',
                  fontWeight: 'bold'
                }}>
                  {selectedIndices.indexOf(index) + 1}
                </div>
              )}
              {/* 이미지 번호 라벨 */}
              <div style={{ textAlign: 'center', marginTop: '5px' }}>#{index + 1}</div>
            </div>
          ))}
        </div>
        {/* 오른쪽: 실시간 미리보기 영역 */}
        <div className="selected-preview" style={{ flex: 1, borderLeft: '2px solid #eee', paddingLeft: '20px' }}>
          <h3>실시간 미리보기</h3>
          {selectedPhotos.length === 0 && <p>아직 선택된 사진이 없습니다.</p>}
          {selectedPhotos.map((photo, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
              <img 
                src={photo} 
                alt={`Selected ${idx + 1}`} 
                style={{ width: '200px', border: '2px solid #007bff', borderRadius: '5px' }} 
              />
              <p>선택된 이미지 #{idx + 1}</p>
            </div>
          ))}
        </div>
      </div>
      <button 
        onClick={confirmSelection} 
        disabled={selectedIndices.length !== maxSelect} 
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
      >
        선택 완료
      </button>
    </div>
  );
}

export default PhotoSelector;
