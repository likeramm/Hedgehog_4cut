import React, { useEffect } from 'react';
import mermaid from 'mermaid';

function SelectionFlowchart() {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);
  
  const chartDefinition = `
    graph TD
      A[사진 촬영 완료] --> B[6장 사진 저장됨]
      B --> C[사진 선택 화면 표시]
      C --> D[사용자 4장 선택]
      D --> E[선택 완료 버튼 클릭]
  `;
  
  return (
    <div className="mermaid" style={{ textAlign: 'left', marginBottom: '20px' }}>
      {chartDefinition}
    </div>
  );
}

export default SelectionFlowchart;
