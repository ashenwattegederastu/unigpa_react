'use client'

import { useState } from 'react'
import { Trash, PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getToken } from '@/lib/auth'

interface Module {
    id: number
    code: string
    name: string
    year: number
    semester: number
    credits: number
    grade: string | null
}

interface ModuleTableProps {
    modules: Module[]
    onModuleDeleted: () => void
    onEditModule: (module: Module) => void
}

// Grade color mapping
function getGradeColor(grade: string | null): string {
    if (!grade) return 'bg-muted text-muted-foreground'
    if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400'
    if (grade.startsWith('C')) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
    return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400' // D, F
}

// Group modules by year and semester
function groupModules(modules: Module[]): Map<string, Module[]> {
    const groups = new Map<string, Module[]>()
    for (const mod of modules) {
        const key = `Year ${mod.year} — Semester ${mod.semester}`
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(mod)
    }
    return groups
}

export function ModuleTable({ modules, onModuleDeleted, onEditModule }: ModuleTableProps) {
    const [deleting, setDeleting] = useState<number | null>(null)

    const handleDelete = async (id: number) => {
        setDeleting(id)
        try {
            const res = await fetch(`http://localhost:5000/api/modules/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            })
            if (res.ok) {
                onModuleDeleted()
            }
        } catch (error) {
            console.error('Failed to delete module:', error)
        } finally {
            setDeleting(null)
        }
    }

    const grouped = groupModules(modules)

    if (modules.length === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            {Array.from(grouped.entries()).map(([groupLabel, groupModules]) => (
                <div key={groupLabel}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {groupLabel}
                    </h3>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Code</TableHead>
                                    <TableHead>Module Name</TableHead>
                                    <TableHead className="w-[80px] text-center">Credits</TableHead>
                                    <TableHead className="w-[80px] text-center">Grade</TableHead>
                                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupModules.map((mod) => (
                                    <TableRow key={mod.id}>
                                        <TableCell className="font-mono text-sm font-medium">
                                            {mod.code}
                                        </TableCell>
                                        <TableCell>{mod.name}</TableCell>
                                        <TableCell className="text-center">{mod.credits}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="secondary"
                                                className={`${getGradeColor(mod.grade)} border-0 text-xs font-semibold`}
                                            >
                                                {mod.grade || '—'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                    onClick={() => onEditModule(mod)}
                                                >
                                                    <PencilSimple className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(mod.id)}
                                                    disabled={deleting === mod.id}
                                                >
                                                    {deleting === mod.id ? (
                                                        <Spinner className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Trash className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
        </div>
    )
}
