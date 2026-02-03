import { createContext, useContext, useEffect, useState } from 'react'
import { getMyLabs } from '../services/labs'
import { useAuth } from './AuthContext'
import { ROLES } from '../constants/roles'

const LabContext = createContext(null)

const STORAGE_KEY = 'ldm_selected_lab_id'

export function LabProvider({ children }) {
    const { user, isAuthenticated } = useAuth()
    const [labs, setLabs] = useState([])
    const [selectedLab, setSelectedLab] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setLabs([])
            setSelectedLab(null)
            return
        }

        // Only fetch for relevant roles
        if (user.role === ROLES.LAB_OWNER || user.role === ROLES.LAB_TECHNICIAN) {
            setLoading(true)
            getMyLabs()
                .then((res) => {
                    const fetchedLabs = res.data || []
                    setLabs(fetchedLabs)

                    // Restore selection or default to first
                    const storedId = localStorage.getItem(STORAGE_KEY)
                    const found = fetchedLabs.find((l) => l.id === storedId)

                    if (found) {
                        setSelectedLab(found)
                    } else if (fetchedLabs.length > 0) {
                        setSelectedLab(fetchedLabs[0])
                        localStorage.setItem(STORAGE_KEY, fetchedLabs[0].id)
                    } else {
                        setSelectedLab(null)
                        localStorage.removeItem(STORAGE_KEY)
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch user labs', err)
                    setLabs([])
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            // Admins don't need this context for sidebar, but might need it later?
            // For now sidebar logic for admins is different.
            setLabs([])
            setSelectedLab(null)
        }
    }, [isAuthenticated, user?.role, user?.id])

    const selectLab = (labId) => {
        const lab = labs.find((l) => l.id === labId)
        if (lab) {
            setSelectedLab(lab)
            localStorage.setItem(STORAGE_KEY, lab.id)
        }
    }

    const value = {
        labs,
        selectedLab,
        selectLab,
        loading,
    }

    return <LabContext.Provider value={value}>{children}</LabContext.Provider>
}

export function useLab() {
    const context = useContext(LabContext)
    if (!context) {
        throw new Error('useLab must be used within a LabProvider')
    }
    return context
}
