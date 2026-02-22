'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getToken, getUser, logout } from '@/lib/auth'

const API = 'http://localhost:5000/api/user'

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    }
}

export function SettingsForm() {
    const router = useRouter()
    const user = getUser()

    // Profile state
    const [firstname, setFirstname] = useState(user?.firstname ?? '')
    const [lastname, setLastname] = useState(user?.lastname ?? '')
    const [email, setEmail] = useState(user?.email ?? '')
    const [profileMsg, setProfileMsg] = useState('')
    const [profileErr, setProfileErr] = useState('')
    const [profileLoading, setProfileLoading] = useState(false)

    // Password state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordMsg, setPasswordMsg] = useState('')
    const [passwordErr, setPasswordErr] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)

    // Danger zone state
    const [deleteDataOpen, setDeleteDataOpen] = useState(false)
    const [deleteDataLoading, setDeleteDataLoading] = useState(false)
    const [deleteDataMsg, setDeleteDataMsg] = useState('')
    const [deleteDataErr, setDeleteDataErr] = useState('')
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteErr, setDeleteErr] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false)

    // ─── Profile ───
    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setProfileErr('')
        setProfileMsg('')
        setProfileLoading(true)

        try {
            const res = await fetch(`${API}/profile`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ firstname, lastname, email }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            // Update localStorage with new user info
            localStorage.setItem('user', JSON.stringify(json.user))
            setProfileMsg('Profile updated successfully.')
        } catch (err: unknown) {
            setProfileErr(err instanceof Error ? err.message : 'Failed to update profile.')
        } finally {
            setProfileLoading(false)
        }
    }

    // ─── Password ───
    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setPasswordErr('')
        setPasswordMsg('')

        if (newPassword !== confirmPassword) {
            setPasswordErr('Passwords do not match.')
            return
        }

        setPasswordLoading(true)

        try {
            const res = await fetch(`${API}/password`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            setPasswordMsg('Password changed successfully.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: unknown) {
            setPasswordErr(err instanceof Error ? err.message : 'Failed to change password.')
        } finally {
            setPasswordLoading(false)
        }
    }

    // ─── Delete Data ───
    const handleDeleteData = async () => {
        setDeleteDataErr('')
        setDeleteDataMsg('')
        setDeleteDataLoading(true)

        try {
            const res = await fetch(`${API}/data`, {
                method: 'DELETE',
                headers: authHeaders(),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            setDeleteDataMsg('All degree data has been deleted successfully.')
        } catch (err: unknown) {
            setDeleteDataErr(err instanceof Error ? err.message : 'Failed to delete data.')
        } finally {
            setDeleteDataLoading(false)
        }
    }

    // ─── Delete Account ───
    const handleDeleteAccount = async (e: FormEvent) => {
        e.preventDefault()
        setDeleteErr('')
        setDeleteLoading(true)

        try {
            const res = await fetch(API, {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify({ password: deletePassword }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            logout()
            router.push('/login')
        } catch (err: unknown) {
            setDeleteErr(err instanceof Error ? err.message : 'Failed to delete account.')
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:px-6">
            {/* ─── Profile ─── */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your name and email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        {profileMsg && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
                                {profileMsg}
                            </div>
                        )}
                        {profileErr && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {profileErr}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstname">First Name</Label>
                                <Input
                                    id="firstname"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastname">Last Name</Label>
                                <Input
                                    id="lastname"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={profileLoading}>
                            {profileLoading ? <><Spinner className="h-4 w-4" /> Saving...</> : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* ─── Password ─── */}
            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password. Must be at least 6 characters.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {passwordMsg && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
                                {passwordMsg}
                            </div>
                        )}
                        {passwordErr && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {passwordErr}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={passwordLoading}>
                            {passwordLoading ? <><Spinner className="h-4 w-4" /> Changing...</> : 'Change Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* ─── Danger Zone ─── */}
            <Card className="border-destructive/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <Warning className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        These Actions are Irreversible proceed with caution.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="text-sm font-medium">Delete All Data</p>
                            <p className="text-muted-foreground text-xs">
                                Remove all your degrees. <br /> Your account will remain.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { setDeleteDataMsg(''); setDeleteDataErr(''); setDeleteDataOpen(true) }}
                        >
                            Delete Data
                        </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
                        <div>
                            <p className="text-sm font-medium">Delete Account</p>
                            <p className="text-muted-foreground text-xs">
                                Permanently delete your account and <br />all data.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteAccountOpen(true)}
                        >
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Delete Data Confirmation Dialog ─── */}
            <Dialog open={deleteDataOpen} onOpenChange={setDeleteDataOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <Warning className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Delete All Degree Data</DialogTitle>
                        <DialogDescription className="text-center">
                            This will permanently remove all your degrees and associated data. Your account will remain active.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        {deleteDataMsg && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
                                {deleteDataMsg}
                            </div>
                        )}
                        {deleteDataErr && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                {deleteDataErr}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDataOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteData}
                            disabled={deleteDataLoading}
                        >
                            {deleteDataLoading ? <><Spinner className="h-4 w-4" /> Deleting...</> : 'Yes, Delete All Data'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Account Confirmation Dialog ─── */}
            <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <Warning className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Delete Your Account</DialogTitle>
                        <DialogDescription className="text-center">
                            This action is permanent and cannot be undone. All your data will be lost. Enter your password to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDeleteAccount}>
                        <div className="space-y-4 py-2">
                            {deleteErr && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                    {deleteErr}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="delete-password">Password</Label>
                                <Input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password to confirm"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteAccountOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={deleteLoading}>
                                {deleteLoading ? <><Spinner className="h-4 w-4" /> Deleting...</> : 'Permanently Delete Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
