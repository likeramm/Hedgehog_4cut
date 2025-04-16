import React, { useEffect } from 'react';
import mermaid from 'mermaid';

function SelectionFlowchart() {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);
  
  const chartDefinition = `
    graph TD
      A[촬영 완료 - 6장 저장됨] --> B[사진 선택 화면]
      B --> C[좌측: 전체 썸네일 (# 표시)]
      C --> D[우측: 실시간 미리보기]
      D --> E[사용자 4장 선택 완료]
  `;
  
  return (
    <div className="mermaid" style={{ textAlign: 'left', marginBottom: '20px' }}>
      {chartDefinition}
    </div>
  );
}

export default SelectionFlowchart;
