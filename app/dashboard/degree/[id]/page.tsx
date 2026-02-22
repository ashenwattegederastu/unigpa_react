'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, BooksIcon, TrophyIcon, CertificateIcon } from '@phosphor-icons/react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { SidebarTrigger, SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ModuleTable } from '@/components/module-table'
import { AddModuleDialog } from '@/components/add-module-dialog'
import { EditModuleDialog } from '@/components/edit-module-dialog'
import { getToken } from '@/lib/auth'

interface Degree {
    id: number
    name: string
    university: string
    grading_scale: string
    duration_years: number
    current_semester: number
}

interface Module {
    id: number
    code: string
    name: string
    year: number
    semester: number
    credits: number
    grade: string | null
}

interface Stats {
    gpa: number | null
    totalCredits: number
    completedCredits: number
    moduleCount: number
    gradedCount: number
}

export default function DegreeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const degreeId = Number(params.id)

    const [degree, setDegree] = useState<Degree | null>(null)
    const [modules, setModules] = useState<Module[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editingModule, setEditingModule] = useState<Module | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/modules/${degreeId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            })
            const json = await res.json()
            if (res.ok) {
                setDegree(json.degree)
                setModules(json.modules)
                setStats(json.stats)
            }
        } catch (error) {
            console.error('Failed to fetch degree data:', error)
        } finally {
            setLoading(false)
        }
    }, [degreeId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleEditModule = (mod: Module) => {
        setEditingModule(mod)
        setEditOpen(true)
    }

    if (loading) {
        return (
            <SidebarProvider
                style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
                        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </header>
                    <div className="px-4 py-6 lg:px-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (!degree) {
        return (
            <SidebarProvider
                style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
                        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                            <span className="text-sm text-muted-foreground">Degree not found</span>
                        </div>
                    </header>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">This degree could not be found.</p>
                            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    const totalSemesters = degree.duration_years * 2
    const progressPercent = stats
        ? Math.min(100, Math.round((stats.completedCredits / Math.max(stats.totalCredits, 1)) * 100))
        : 0

    return (
        <SidebarProvider
            style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                {/* Header */}
                <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
                    <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2 -ml-1"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Button>
                        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-medium">{degree.name}</h1>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
                    {/* Stats cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* GPA Card */}
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <TrophyIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Current GPA</p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {stats?.gpa !== null && stats?.gpa !== undefined
                                            ? stats.gpa.toFixed(2)
                                            : '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        out of {degree.grading_scale}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Credits Card */}
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <CertificateIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Credits</p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {stats?.completedCredits ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        of {stats?.totalCredits ?? 0} total credits
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modules Card */}
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                    <BooksIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Modules</p>
                                    <p className="text-2xl font-bold tracking-tight">
                                        {stats?.moduleCount ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.gradedCount ?? 0} graded
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Degree Progress
                            </span>
                            <span className="font-medium">
                                {stats?.completedCredits ?? 0} / {stats?.totalCredits || 0} credits
                            </span>
                        </div>
                        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Modules section */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Modules</h2>
                            <Button size="sm" onClick={() => setAddOpen(true)}>
                                <Plus className="mr-1.5 h-4 w-4" />
                                Add Module
                            </Button>
                        </div>

                        {modules.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                        <BooksIcon className="text-muted-foreground h-6 w-6" />
                                    </div>
                                    <h3 className="mb-1 text-base font-medium">No modules yet</h3>
                                    <p className="text-muted-foreground mb-3 max-w-sm text-center text-sm">
                                        Add your first module to start tracking your grades.
                                    </p>
                                    <Button size="sm" onClick={() => setAddOpen(true)}>
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Add Your First Module
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <ModuleTable
                                modules={modules}
                                onModuleDeleted={fetchData}
                                onEditModule={handleEditModule}
                            />
                        )}
                    </div>
                </div>

                {/* Dialogs */}
                <AddModuleDialog
                    open={addOpen}
                    onOpenChange={setAddOpen}
                    onModuleAdded={fetchData}
                    degreeId={degreeId}
                    durationYears={degree.duration_years}
                />
                <EditModuleDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    onModuleUpdated={fetchData}
                    module={editingModule}
                    durationYears={degree.duration_years}
                />
            </SidebarInset>
        </SidebarProvider>
    )
}
