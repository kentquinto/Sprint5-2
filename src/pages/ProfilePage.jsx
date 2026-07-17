import { useState, useEffect } from 'react'
import { getMe } from '../api/me'
import { getGames } from '../api/games'
import PageShell from '../components/PageShell'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'
import ProfileInfoForm from '../components/profile/ProfileInfoForm'
import ChangePasswordForm from '../components/profile/ChangePasswordForm'
import DangerZone from '../components/profile/DangerZone'
import usePageTitle from '../hooks/usePageTitle'

// Account settings — loads the data, then composes the three independent
// sections. Each section owns its own form state and submit.
export default function ProfilePage() {
  usePageTitle('Profile Settings')

  const [profile, setProfile] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    Promise.all([
      getMe(),
      getGames(),
    ]).then(([me, gameList]) => {
      setProfile(me)
      setGames(gameList)
    }).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [])

  if (loading)   return <PageScreen message="Loading profile..." />
  if (loadError) return <PageScreen message="Could not load profile. Please try again." error />

  return (
    <PageShell>
      <SkyBanner eyebrow={profile.name} title="Profile Settings" subtitle="Manage your account information" />

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6 animate-fade-in-up">
        <ProfileInfoForm profile={profile} games={games} onUpdated={setProfile} />
        <ChangePasswordForm />
        <DangerZone />
      </div>
    </PageShell>
  )
}
