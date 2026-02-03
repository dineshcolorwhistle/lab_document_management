import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, updatePassword } from '../services/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { User, Lock, Mail, Shield, Save } from 'lucide-react'

export function ProfilePage() {
    const { user, refreshUser } = useAuth()

    const [profileForm, setProfileForm] = useState({ name: '' })
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name || '' })
        }
    }, [user])

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setProfileMessage({ type: '', text: '' })

        if (!profileForm.name.trim()) {
            setProfileMessage({ type: 'error', text: 'Name cannot be empty' })
            return
        }

        setProfileLoading(true)
        try {
            await updateProfile({ name: profileForm.name })
            await refreshUser()
            setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
        } catch (err) {
            setProfileMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update profile' })
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        setPasswordMessage({ type: '', text: '' })

        if (passwordForm.newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters' })
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        setPasswordLoading(true)
        try {
            await updatePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            })
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setPasswordMessage({ type: 'success', text: 'Password updated successfully' })
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update password' })
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">Manage your account information and security preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <Card className="p-6 border-border/60 shadow-sm md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Full Name
                            </label>
                            <Input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your name"
                                className="bg-background"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="pl-9 bg-muted/50 cursor-not-allowed text-muted-foreground"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Role
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={user?.role?.replace('_', ' ') || ''}
                                    disabled
                                    className="pl-9 bg-muted/50 cursor-not-allowed text-muted-foreground capitalize"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Role is assigned by administrator</p>
                        </div>

                        {profileMessage.text && (
                            <Alert variant={profileMessage.type === 'error' ? 'danger' : 'success'}>
                                {profileMessage.text}
                            </Alert>
                        )}

                        <div className="pt-2">
                            <Button type="submit" disabled={profileLoading} className="w-full sm:w-auto">
                                {profileLoading ? 'Saving...' : 'Update Profile'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Security Settings */}
                <Card className="p-6 border-border/60 shadow-sm md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-foreground">Security</h3>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Current Password
                            </label>
                            <Input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                                className="bg-background"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                New Password
                            </label>
                            <Input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min. 8 characters"
                                className="bg-background"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                                className="bg-background"
                            />
                        </div>

                        {passwordMessage.text && (
                            <Alert variant={passwordMessage.type === 'error' ? 'danger' : 'success'}>
                                {passwordMessage.text}
                            </Alert>
                        )}

                        <div className="pt-2">
                            <Button type="submit" disabled={passwordLoading} variant="outline" className="w-full sm:w-auto">
                                {passwordLoading ? 'Updating...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
