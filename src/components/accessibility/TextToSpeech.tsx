
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface TextToSpeechProps {
  text: string;
  buttonLabel?: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, buttonLabel = "Read Aloud" }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Your browser doesn't support text to speech");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthRef.current = utterance;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.includes('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Error occurred while speaking");
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  React.useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  return (
    <Button 
      onClick={handleSpeak}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
    >
      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="sr-only md:not-sr-only md:inline-block">
        {isSpeaking ? "Stop" : buttonLabel}
      </span>
    </Button>
  );
};

export default TextToSpeech;
