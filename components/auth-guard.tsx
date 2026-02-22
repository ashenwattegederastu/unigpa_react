'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/login')
        } else {
            setChecked(true)
        }
    }, [router])

    if (!checked) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner className="text-primary h-8 w-8" />
            </div>
        )
    }

    return <>{children}</>
}
