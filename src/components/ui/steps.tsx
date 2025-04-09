
import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps {
  children: React.ReactNode
  className?: string
}

export function Steps({ children, className }: StepsProps) {
  const filteredChildren = React.Children.toArray(children).filter(Boolean)
  const totalSteps = filteredChildren.length
  const stepWidth = totalSteps > 0 ? 100 / totalSteps : 100

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex w-full gap-2">
        {filteredChildren.map((child, index) => {
          return React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<StepProps>, {
                stepNumber: index + 1,
                totalSteps,
                stepWidth,
              })
            : child
        })}
      </div>
    </div>
  )
}

interface StepProps {
  title: string
  children: React.ReactNode
  stepNumber?: number
  totalSteps?: number
  stepWidth?: number
  className?: string
}

export function Step({
  title,
  children,
  stepNumber,
  totalSteps,
  stepWidth,
  className,
}: StepProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ width: `${stepWidth}%` }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {stepNumber}
        </div>
        <div className="font-medium">{title}</div>
        {stepNumber !== totalSteps && (
          <div className="ml-auto h-px flex-1 bg-muted" />
        )}
      </div>
      <div className="ml-8 mt-2 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
