
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Keyboard as KeyboardIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface VirtualKeyboardProps {
  onKeyPress?: (key: string) => void;
  targetInputId?: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  onKeyPress, 
  targetInputId 
}) => {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  
  const keys = {
    row1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    row2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    row3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
    row4: ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    row5: ['Space']
  };

  const shiftKeys = {
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
    ';': ':', '\'': '"', ',': '<', '.': '>', '/': '?'
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Shift') {
      setShift(prev => !prev);
      return;
    }
    
    if (key === 'CapsLock') {
      setCapsLock(prev => !prev);
      return;
    }
    
    if (key === 'Backspace') {
      handleBackspace();
      return;
    }

    if (key === 'Enter') {
      handleEnterKey();
      return;
    }

    if (key === 'Space') {
      key = ' ';
    }

    // Process key with shift/caps logic
    let processedKey = key;
    if (shift && (key in shiftKeys)) {
      processedKey = shiftKeys[key as keyof typeof shiftKeys];
    } else if ((shift || capsLock) && key.length === 1 && key.match(/[a-z]/i)) {
      processedKey = key.toUpperCase();
    }

    // Apply the key
    if (onKeyPress) {
      onKeyPress(processedKey);
    } else if (targetInputId) {
      const input = document.getElementById(targetInputId) as HTMLInputElement;
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        input.value = input.value.substring(0, start) + processedKey + input.value.substring(end);
        input.selectionStart = input.selectionEnd = start + 1;
        input.focus();
      }
    }

    // Reset shift after using it
    if (shift) {
      setShift(false);
    }
  };

  const handleBackspace = () => {
    if (targetInputId) {
      const input = document.getElementById(targetInputId) as HTMLInputElement;
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        
        if (start === end) {
          // No selection, delete previous character
          if (start > 0) {
            input.value = input.value.substring(0, start - 1) + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start - 1;
          }
        } else {
          // Delete selected text
          input.value = input.value.substring(0, start) + input.value.substring(end);
          input.selectionStart = input.selectionEnd = start;
        }
        
        input.focus();
      }
    } else if (onKeyPress) {
      onKeyPress('Backspace');
    }
  };

  const handleEnterKey = () => {
    if (targetInputId) {
      const input = document.getElementById(targetInputId) as HTMLInputElement;
      if (input && input.form) {
        // If input is part of a form, submit the form
        const form = input.form;
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }
    } else if (onKeyPress) {
      onKeyPress('Enter');
    }
  };

  const renderKey = (key: string, index: number) => {
    let displayKey = key;
    let className = "px-2 py-1 text-sm border rounded hover:bg-muted/50";
    
    if (key === 'Space') {
      displayKey = ' ';
      className += " w-32";
    } else if (['Enter', 'Backspace', 'Shift'].includes(key)) {
      className += " px-3 bg-muted/20";
    }
    
    if ((shift || capsLock) && key.length === 1 && key.match(/[a-z]/i)) {
      displayKey = key.toUpperCase();
    } else if (shift && (key in shiftKeys)) {
      displayKey = shiftKeys[key as keyof typeof shiftKeys];
    }

    return (
      <Button
        key={index}
        type="button"
        variant="outline"
        className={className}
        onClick={() => handleKeyPress(key)}
      >
        {key === 'Space' ? 'Space' : displayKey}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          aria-label="Open virtual keyboard"
        >
          <KeyboardIcon className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline-block">Keyboard</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Virtual Keyboard</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1 justify-center">
            {keys.row1.map(renderKey)}
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {keys.row2.map(renderKey)}
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {keys.row3.map(renderKey)}
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {keys.row4.map(renderKey)}
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {keys.row5.map(renderKey)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualKeyboard;
