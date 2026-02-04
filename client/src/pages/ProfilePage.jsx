import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, updatePassword } from '../services/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { User, Lock, Mail, Shield, Save, Camera } from 'lucide-react'
import { API_URL } from '../utils/env'

export function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const fileInputRef = useRef(null)

    const [profileForm, setProfileForm] = useState({ name: '' })
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

    const [selectedFile, setSelectedFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

    const baseUrl = API_URL.replace(/\/api$/, '')

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name || '' })
            if (user.profileImage) {
                setImagePreview(`${baseUrl}/${user.profileImage}`)
            }
        }
    }, [user, baseUrl])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                setProfileMessage({ type: 'error', text: 'Please select an image file' })
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                setProfileMessage({ type: 'error', text: 'Image size should be less than 5MB' })
                return
            }
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setProfileMessage({ type: '', text: '' })

        if (!profileForm.name.trim()) {
            setProfileMessage({ type: 'error', text: 'Name cannot be empty' })
            return
        }

        setProfileLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', profileForm.name)
            if (selectedFile) {
                formData.append('profileImage', selectedFile)
            }

            await updateProfile(formData)
            await refreshUser()
            setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
            setSelectedFile(null)
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
                    <div className="flex items-center gap-2 mb-6">
                        <User className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        {/* Profile Image Upload */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-2">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border/60 group-hover:border-blue-500 transition-colors">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-muted-foreground uppercase text-2xl font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white shadow-lg border border-white hover:bg-blue-700 transition-all transform hover:scale-110"
                                    title="Upload Photo"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                <h4 className="text-sm font-medium text-foreground">Profile Picture</h4>
                                <p className="text-xs text-muted-foreground">
                                    Click the camera icon to upload a new photo. Max 5MB.
                                </p>
                                {selectedFile && (
                                    <p className="text-xs text-blue-600 font-medium">
                                        Selected: {selectedFile.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
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
