import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-8 lg:px-10 lg:py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Logo */}
          <div className="relative w-32 h-32 lg:w-40 lg:h-40 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse-glow" />
            <Image
              src="/images/votan-logo.jpeg"
              alt="V•Tanit"
              fill
              className="object-contain relative z-10"
              priority
            />
          </div>

          {/* Text */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="chrome-text">V•Tanit</span>
            </h1>
            <p className="text-sm lg:text-base text-accent uppercase tracking-[0.3em] mt-2 glow-gold-text">
              AI Trading Intelligence
            </p>
            <p className="text-muted-foreground mt-4 max-w-md text-sm lg:text-base">
              Persistent memory. Institutional execution. Your AI-powered trading companion 
              with real-time market analysis and adaptive strategy management.
            </p>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                System Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Memory Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-xs font-medium text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Execution Locked
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
