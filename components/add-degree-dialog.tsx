'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useState, FormEvent } from 'react'
import { getToken } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'

interface AddDegreeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDegreeAdded: () => void
}

export function AddDegreeDialog({ open, onOpenChange, onDegreeAdded }: AddDegreeDialogProps) {
    const [name, setName] = useState('')
    const [university, setUniversity] = useState('')
    const [gradingScale, setGradingScale] = useState('4.0')
    const [durationYears, setDurationYears] = useState('3')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('http://localhost:5000/api/degrees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    name,
                    university,
                    grading_scale: gradingScale,
                    duration_years: parseInt(durationYears),
                }),
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.message || 'Failed to create degree')

            // Reset form and close
            setName('')
            setUniversity('')
            setGradingScale('4.0')
            setDurationYears('3')
            onOpenChange(false)
            onDegreeAdded()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a New Degree</DialogTitle>
                    <DialogDescription>
                        Enter the details for your degree program.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="degree-name">Degree Name</Label>
                            <Input
                                id="degree-name"
                                placeholder="e.g. BSc Computer Science"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="university">University</Label>
                            <Input
                                id="university"
                                placeholder="e.g. University of Colombo"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="grading-scale">Grading Scale</Label>
                                <Select value={gradingScale} onValueChange={setGradingScale}>
                                    <SelectTrigger id="grading-scale">
                                        <SelectValue placeholder="Select scale" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4.0">4.0 Scale</SelectItem>
                                        <SelectItem value="4.2">4.2 Scale</SelectItem>
                                        <SelectItem value="5.0">5.0 Scale</SelectItem>
                                        <SelectItem value="7.0">7.0 Scale</SelectItem>
                                        <SelectItem value="10.0">10.0 Scale</SelectItem>
                                        <SelectItem value="100">Percentage (100)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (Years)</Label>
                                <Select value={durationYears} onValueChange={setDurationYears}>
                                    <SelectTrigger id="duration">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Year</SelectItem>
                                        <SelectItem value="2">2 Years</SelectItem>
                                        <SelectItem value="3">3 Years</SelectItem>
                                        <SelectItem value="4">4 Years</SelectItem>
                                        <SelectItem value="5">5 Years</SelectItem>
                                        <SelectItem value="6">6 Years</SelectItem>
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
                            {loading ? <><Spinner className="h-4 w-4" /> Adding...</> : 'Add Degree'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
