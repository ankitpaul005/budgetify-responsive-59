
import React from 'react';
import TextToSpeech from './TextToSpeech';
import VirtualKeyboard from './VirtualKeyboard';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccessibilityToolsProps {
  text?: string;
  showKeyboard?: boolean;
  targetInputId?: string;
  helpText?: string;
}

const AccessibilityTools: React.FC<AccessibilityToolsProps> = ({ 
  text, 
  showKeyboard = false,
  targetInputId,
  helpText
}) => {
  return (
    <div className="flex items-center gap-2">
      {text && <TextToSpeech text={text} />}
      {showKeyboard && <VirtualKeyboard targetInputId={targetInputId} />}
      {helpText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help flex items-center">
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{helpText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default AccessibilityTools;
