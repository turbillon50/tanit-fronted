"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const loadingSteps = [
  "Initializing Tanit...",
  "Loading memory...",
  "Scanning markets...",
  "Execution locked...",
  "System online.",
]

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const stepDuration = 600
    const totalDuration = stepDuration * loadingSteps.length

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (totalDuration / 50))
        return newProgress > 100 ? 100 : newProgress
      })
    }, 50)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration)

    const exitTimer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onComplete, 500)
    }, totalDuration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
      clearTimeout(exitTimer)
    }
  }, [onComplete])

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(onComplete, 300)
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500",
        isExiting ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Radial Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.08) 0%, transparent 60%)'
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
      >
        Skip
      </button>

      {/* Main Content */}
      <div className="relative flex flex-col items-center gap-8 px-6">
        {/* Logo with Glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-[40px] animate-pulse" />
          <div className={cn(
            "relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-1000",
            !isExiting && "animate-[float_3s_ease-in-out_infinite]"
          )}>
            <Image
              src="/images/votan-logo.jpeg"
              alt="V•Tanit"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Rotating Ring */}
          <svg 
            className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#splash-gradient)"
              strokeWidth="2"
              strokeDasharray="565.48"
              strokeDashoffset={565.48 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-100"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
            <defs>
              <linearGradient id="splash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(217, 70, 239)" />
                <stop offset="50%" stopColor="rgb(236, 72, 153)" />
                <stop offset="100%" stopColor="rgb(217, 70, 239)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold chrome-text tracking-wider">
            V•Tanit
          </h1>
          <p className="mt-2 text-xs md:text-sm uppercase tracking-[0.3em] text-primary/80 font-medium">
            AI Trading Intelligence
          </p>
        </div>

        {/* Loading Steps */}
        <div className="h-6 flex items-center">
          <p className={cn(
            "text-sm font-mono text-muted-foreground transition-all duration-300",
            "animate-pulse"
          )}>
            {loadingSteps[currentStep]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
