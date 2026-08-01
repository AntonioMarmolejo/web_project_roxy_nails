import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/useAuthStore'
import PageHeader from '../components/PageHeader'
import PasswordInput from '../components/PasswordInput'
import '../styles/Profile.css'

export default function Profile() {
    const { user, updateProfile, changePassword } = useAuthStore()

    const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileMsg, setProfileMsg] = useState('')
    const [profileError, setProfileError] = useState('')

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [pwLoading, setPwLoading] = useState(false)
    const [pwMsg, setPwMsg] = useState('')
    const [pwError, setPwError] = useState('')

    const submitProfile = async (e) => {
        e.preventDefault()
        setProfileMsg(''); setProfileError(''); setProfileLoading(true)
        try {
            await updateProfile(profileForm.name, profileForm.phone)
            setProfileMsg('Datos actualizados ✓')
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Error al guardar los cambios.')
        } finally {
            setProfileLoading(false)
        }
    }

    const submitPassword = async (e) => {
        e.preventDefault()
        setPwMsg(''); setPwError('')
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwError('Las contraseñas nuevas no coinciden.')
            return
        }
        setPwLoading(true)
        try {
            await changePassword(pwForm.currentPassword, pwForm.newPassword)
            setPwMsg('Contraseña actualizada ✓')
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
        } catch (err) {
            setPwError(err.response?.data?.message || 'Error al cambiar la contraseña.')
        } finally {
            setPwLoading(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>Mi perfil — Roxy Nails</title>
                <meta name="description" content="Edita tus datos y contraseña en Roxy Nails." />
            </Helmet>

            <PageHeader
                label="Mi cuenta"
                title="Mi perfil"
                subtitle="Edita tus datos personales y tu contraseña."
            />

            <div className="profile">
                <form onSubmit={submitProfile} className="profile__card">
                    <h2 className="profile__card-title">Datos personales</h2>

                    <div>
                        <label className="profile__label">Nombre completo</label>
                        <input
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                            className="profile__input" required
                        />
                    </div>
                    <div>
                        <label className="profile__label">Teléfono / WhatsApp</label>
                        <input
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                            className="profile__input" placeholder="+593 99 123 4567"
                        />
                    </div>
                    <div>
                        <label className="profile__label">Correo electrónico</label>
                        <input value={user?.email || ''} disabled className="profile__input profile__input--disabled" />
                    </div>

                    {profileMsg && <p className="profile__success">{profileMsg}</p>}
                    {profileError && <p className="profile__error">{profileError}</p>}

                    <button type="submit" disabled={profileLoading} className="profile__submit-btn">
                        {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>

                <form onSubmit={submitPassword} className="profile__card">
                    <h2 className="profile__card-title">Cambiar contraseña</h2>

                    <div>
                        <label className="profile__label">Contraseña actual</label>
                        <PasswordInput
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                            className="profile__input" required
                        />
                    </div>
                    <div>
                        <label className="profile__label">Nueva contraseña</label>
                        <PasswordInput
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                            className="profile__input" required minLength={6}
                        />
                    </div>
                    <div>
                        <label className="profile__label">Confirmar nueva contraseña</label>
                        <PasswordInput
                            value={pwForm.confirm}
                            onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                            className="profile__input" required minLength={6}
                        />
                    </div>

                    {pwMsg && <p className="profile__success">{pwMsg}</p>}
                    {pwError && <p className="profile__error">{pwError}</p>}

                    <button type="submit" disabled={pwLoading} className="profile__submit-btn">
                        {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                </form>
            </div>
        </>
    )
}
