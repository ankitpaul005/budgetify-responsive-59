
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Steps, Step } from "@/components/ui/steps";
import TextToSpeech from './TextToSpeech';

interface GuideStep {
  title: string;
  description: string;
}

interface PageGuideProps {
  title: string;
  steps: GuideStep[];
}

const PageGuide: React.FC<PageGuideProps> = ({ title, steps }) => {
  const [open, setOpen] = useState(false);

  // Create full guide text for text-to-speech
  const getFullGuideText = () => {
    return `${title}. ${steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}. ${step.description}`
    ).join('. ')}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          aria-label="Page guide and help"
        >
          <QuestionMarkCircledIcon className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline-block">Help Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="flex justify-end">
            <TextToSpeech text={getFullGuideText()} buttonLabel="Read Guide" />
          </div>
        </DialogHeader>
        <div className="py-4">
          <Steps>
            {steps.map((step, index) => (
              <Step key={index} title={step.title}>
                {step.description}
              </Step>
            ))}
          </Steps>
        </div>
        <DialogClose asChild>
          <Button className="w-full">Got it</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default PageGuide;
