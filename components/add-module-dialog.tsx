'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getToken } from '@/lib/auth'

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']

interface AddModuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onModuleAdded: () => void
    degreeId: number
    durationYears: number
}

export function AddModuleDialog({
    open,
    onOpenChange,
    onModuleAdded,
    degreeId,
    durationYears,
}: AddModuleDialogProps) {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [year, setYear] = useState('1')
    const [semester, setSemester] = useState('1')
    const [credits, setCredits] = useState('3')
    const [grade, setGrade] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('http://localhost:5000/api/modules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    degree_id: degreeId,
                    code,
                    name,
                    year: parseInt(year),
                    semester: parseInt(semester),
                    credits: parseInt(credits),
                    grade: grade || null,
                }),
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.message || 'Failed to add module')

            // Reset form and close
            setCode('')
            setName('')
            setYear('1')
            setSemester('1')
            setCredits('3')
            setGrade('')
            onOpenChange(false)
            onModuleAdded()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Module</DialogTitle>
                    <DialogDescription>
                        Enter the details for your module/subject.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="module-code">Code</Label>
                                <Input
                                    id="module-code"
                                    placeholder="CS1012"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="module-name">Module Name</Label>
                                <Input
                                    id="module-name"
                                    placeholder="Data Structures & Algorithms"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="module-year">Year</Label>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger id="module-year">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: durationYears }, (_, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>
                                                Year {i + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="module-semester">Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                    <SelectTrigger id="module-semester">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Sem 1</SelectItem>
                                        <SelectItem value="2">Sem 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="module-credits">Credits</Label>
                                <Input
                                    id="module-credits"
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={credits}
                                    onChange={(e) => setCredits(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="module-grade">Grade</Label>
                                <Select value={grade} onValueChange={setGrade}>
                                    <SelectTrigger id="module-grade">
                                        <SelectValue placeholder="N/A" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Grade</SelectItem>
                                        {GRADES.map((g) => (
                                            <SelectItem key={g} value={g}>
                                                {g}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading}>
                            {loading ? <><Spinner className="h-4 w-4" /> Adding...</> : 'Add Module'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
