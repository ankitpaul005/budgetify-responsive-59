import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface TextToSpeechProps {
  text: string;
  buttonLabel?: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, buttonLabel = "Read Aloud" }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoaded = useRef(false);
  
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    
    const handleVoicesChanged = () => {
      voicesLoaded.current = true;
    };
    
    if (window.speechSynthesis.getVoices().length > 0) {
      voicesLoaded.current = true;
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
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

    setIsLoading(true);
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthRef.current = utterance;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.includes('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        setIsLoading(false);
        toast.error("Error occurred while speaking");
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      
      const resumeInfinity = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeInfinity);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
      
      utterance.onend = () => {
        clearInterval(resumeInfinity);
        setIsSpeaking(false);
      };
      
    } catch (error) {
      console.error("Text to speech error:", error);
      setIsLoading(false);
      toast.error("Failed to start text-to-speech");
    }
  };

  useEffect(() => {
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
      disabled={isLoading}
    >
      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="sr-only md:not-sr-only md:inline-block">
        {isLoading ? "Loading..." : isSpeaking ? "Stop" : buttonLabel}
      </span>
    </Button>
  );
};

export default TextToSpeech;
