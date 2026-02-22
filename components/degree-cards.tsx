'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PlusSquareIcon, PlusIcon, Trash, GraduationCap } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AddDegreeDialog } from '@/components/add-degree-dialog'
import { getToken } from '@/lib/auth'

interface Degree {
    id: number
    name: string
    university: string
    grading_scale: string
    duration_years: number
    current_semester: number
    gpa: number | null
    totalCredits: number
    completedCredits: number
    moduleCount: number
    created_at: string
}

export function DegreeCards() {
    const router = useRouter()
    const [degrees, setDegrees] = useState<Degree[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)

    const fetchDegrees = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/degrees', {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            })
            const json = await res.json()
            if (res.ok) {
                setDegrees(json.degrees)
            }
        } catch (error) {
            console.error('Failed to fetch degrees:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDegrees()
    }, [fetchDegrees])

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        setDeleting(id)
        try {
            const res = await fetch(`http://localhost:5000/api/degrees/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            })
            if (res.ok) {
                setDegrees((prev) => prev.filter((d) => d.id !== id))
            }
        } catch (error) {
            console.error('Failed to delete degree:', error)
        } finally {
            setDeleting(null)
        }
    }

    if (loading) {
        return (
            <div className="px-4 lg:px-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 lg:px-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Your Degrees</h2>
                    <p className="text-muted-foreground text-sm">
                        Manage your degree programs and track your GPA.
                    </p>
                </div>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                    <PlusIcon className="mr-1.5 h-4 w-4" />
                    Add Degree
                </Button>
            </div>

            {degrees.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                            <GraduationCap className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h3 className="mb-1 text-base font-medium">No degrees yet</h3>
                        <p className="text-muted-foreground mb-3 max-w-sm text-center text-sm">
                            Add your first degree to start tracking your GPA.
                        </p>
                        <Button size="sm" onClick={() => setDialogOpen(true)}>
                            <PlusSquareIcon className="mr-1.5 h-4 w-4" />
                            Add Your First Degree
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {degrees.map((degree) => {
                        const progressPercent = degree.totalCredits > 0
                            ? Math.min(100, Math.round((degree.completedCredits / degree.totalCredits) * 100))
                            : 0

                        return (
                            <Card
                                key={degree.id}
                                className="group relative cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => router.push(`/dashboard/degree/${degree.id}`)}
                            >
                                <CardContent className="p-4">
                                    {/* Header row */}
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-semibold leading-tight">
                                                {degree.name}
                                            </h3>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {degree.university}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive -mr-1 -mt-1 h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={(e) => handleDelete(e, degree.id)}
                                            disabled={deleting === degree.id}
                                        >
                                            <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    {/* GPA + Scale row */}
                                    <div className="mb-3 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold tracking-tight">
                                            {degree.gpa !== null ? degree.gpa.toFixed(2) : '—'}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            / {degree.grading_scale} GPA
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                {degree.completedCredits} / {degree.totalCredits} credits
                                            </span>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                                {degree.moduleCount} modules
                                            </Badge>
                                        </div>
                                        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {/* Add degree card */}
                    <Card
                        className="border-dashed cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
                        onClick={() => setDialogOpen(true)}
                    >
                        <CardContent className="flex h-full min-h-[100px] flex-col items-center justify-center p-4">
                            <PlusSquareIcon className="text-muted-foreground mb-1 h-6 w-6" />
                            <span className="text-muted-foreground text-xs font-medium">
                                Add Degree
                            </span>
                        </CardContent>
                    </Card>
                </div>
            )}

            <AddDegreeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onDegreeAdded={fetchDegrees}
            />
        </div>
    )
}
