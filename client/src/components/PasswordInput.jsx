import { useState } from 'react'
import '../styles/PasswordInput.css'

export default function PasswordInput({ className, style, ...props }) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="password-field">
            <input
                {...props}
                type={visible ? 'text' : 'password'}
                className={className}
                style={{ paddingRight: 42, ...style }}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setVisible(v => !v)}
                className="password-field__toggle"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
                {visible ? '🙈' : '👁️'}
            </button>
        </div>
    )
}
