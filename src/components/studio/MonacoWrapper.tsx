import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string | number;
  readOnly?: boolean;
}

const MonacoWrapper: React.FC<MonacoWrapperProps> = ({
  value,
  onChange,
  language = 'cpp',
  height = '400px',
  readOnly = false,
}) => {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(val) => onChange(val || '')}
      theme="vs-dark"
      options={{
        readOnly,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        tabSize: 4,
      }}
    />
  );
};

export default MonacoWrapper;
