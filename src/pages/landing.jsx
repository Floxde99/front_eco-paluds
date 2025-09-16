import React from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Steps from '@/components/landing/Steps'
import Benefits from '@/components/landing/Benefits'
import Testimonial from '@/components/landing/Testimonial'

export default function Landing() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Hero />
      <Steps />
      <Benefits />
      <Testimonial />
    </div>
  )
}
