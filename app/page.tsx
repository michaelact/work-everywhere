'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hasLaravelSession = document.cookie
      .split('; ')
      .some(cookie => cookie.startsWith('laravel_session='))

    if (hasLaravelSession) {
      router.push('/projects')
    } else {
      router.push('/login')
    }
  }, [router])

  return null
}
