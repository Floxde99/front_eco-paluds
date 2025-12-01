import React from 'react'
import Hero from '@/components/landing/Hero'
import Steps from '@/components/landing/Steps'
import Benefits from '@/components/landing/Benefits'
import Testimonial from '@/components/landing/Testimonial'
import Modules from '@/components/landing/Modules'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Hero />
      <Modules />
      <Steps />
      <Benefits />
      <Testimonial />
    </div>
  )
}
