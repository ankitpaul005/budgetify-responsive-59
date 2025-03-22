
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

const VoiceCommandListener: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandExecuted, setCommandExecuted] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  // Initialize speech recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';
      
      recognition.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        console.log('Speech recognized:', speechResult);
        setTranscript(speechResult);
        processCommand(speechResult);
      };
      
      recognition.current.onend = () => {
        if (!commandExecuted) {
          setIsListening(false);
        }
      };
      
      recognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Voice command error. Please try again.');
      };
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const processCommand = (command: string) => {
    setCommandExecuted(true);
    
    if (command.includes('dashboard') || command.includes('home')) {
      toast.success('Navigating to Dashboard');
      navigate('/dashboard');
    } else if (command.includes('investment') || command.includes('invest')) {
      toast.success('Navigating to Investments');
      navigate('/investments');
    } else if (command.includes('analytics') || command.includes('analyze')) {
      toast.success('Navigating to Analytics');
      navigate('/analytics');
    } else if (command.includes('profile') || command.includes('account')) {
      toast.success('Navigating to Profile');
      navigate('/profile');
    } else if (command.includes('login') || command.includes('sign in')) {
      toast.success('Navigating to Login');
      navigate('/login');
    } else if (command.includes('sign up') || command.includes('register')) {
      toast.success('Navigating to Sign Up');
      navigate('/signup');
    } else if (command.includes('help') || command.includes('support')) {
      toast.success('Opening help assistant');
      // This would trigger the chatbot to open
      document.getElementById('chatbot-trigger')?.click();
    } else {
      toast.info(`Command not recognized: "${command}"`);
      setCommandExecuted(false);
    }
    
    setTimeout(() => {
      setIsListening(false);
      setCommandExecuted(false);
    }, 1000);
  };

  const toggleListening = () => {
    if (!recognition.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setIsListening(true);
      recognition.current.start();
      toast.info('Listening for voice commands...');
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative group">
        <Button
          onClick={toggleListening}
          className={`rounded-full w-14 h-14 shadow-lg ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
          } text-primary-foreground transition-all duration-200`}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
          id="voice-command-button"
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-background rounded-md px-3 py-1 text-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isListening ? 'Click to stop' : 'Click for voice command'}
        </div>
        
        {isListening && (
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <div className="absolute w-full h-full rounded-full bg-red-500 animate-ping opacity-75"></div>
            <div className="relative w-full h-full rounded-full bg-red-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommandListener;
