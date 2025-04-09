
import React from 'react';
import TextToSpeech from './TextToSpeech';
import VirtualKeyboard from './VirtualKeyboard';

interface AccessibilityToolsProps {
  text?: string;
  showKeyboard?: boolean;
  targetInputId?: string;
}

const AccessibilityTools: React.FC<AccessibilityToolsProps> = ({ 
  text, 
  showKeyboard = false,
  targetInputId
}) => {
  return (
    <div className="flex items-center gap-2">
      {text && <TextToSpeech text={text} />}
      {showKeyboard && <VirtualKeyboard targetInputId={targetInputId} />}
    </div>
  );
};

export default AccessibilityTools;
