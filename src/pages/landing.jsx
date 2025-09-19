import React from 'react'
import Hero from '@/components/landing/Hero'
import Steps from '@/components/landing/Steps'
import Benefits from '@/components/landing/Benefits'
import Testimonial from '@/components/landing/Testimonial'

export default function Landing() {
  return (
    <div className="bg-white min-h-screen">
      <Hero />
      <Steps />
      <Benefits />
      <Testimonial />
    </div>
  )
}
