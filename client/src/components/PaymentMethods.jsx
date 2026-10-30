import { useState } from 'react'
import { PREPAID_METHODS, PAYMENT_HOLDER, BANK_ACCOUNTS, RECEIPT_PHONE } from '../config/payments'
import '../styles/Checkout.css'
import '../styles/PaymentMethods.css'

// Opciones de pago por adelantado listas para <PaymentMethods options={...}>
export const PREPAID_OPTIONS = Object.entries(PREPAID_METHODS).map(([value, m]) => ({ value, icon: m.icon, label: m.label }))

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch { /* el portapapeles no está disponible: el número se puede copiar a mano */ }
    }
    return (
        <button type="button" onClick={copy} className="payment__copy-btn">
            {copied ? '✓ Copiado' : 'Copiar'}
        </button>
    )
}

// Instrucciones del método elegido: QR para escanear o cuentas para transferir
function PrepaidDetails({ method, amount }) {
    const m = PREPAID_METHODS[method]
    if (!m) return null
    const amountText = amount != null ? <strong>${Number(amount).toFixed(2)}</strong> : 'el monto'

    return (
        <div className="checkout__qr-box">
            {m.qr ? (
                <>
                    <img src={m.qr} alt={`Código QR — ${m.label}`} className="payment__qr-img" />
                    <p className="checkout__qr-note">
                        Escanea este código con la app <strong>{m.app}</strong>, ingresa {amountText} y confirma el pago.
                    </p>
                    {m.link && (
                        <a href={m.link} target="_blank" rel="noopener noreferrer" className="payment__app-link">
                            ¿Estás en el celular? Abrir {m.app}
                        </a>
                    )}
                </>
            ) : (
                <>
                    <p className="checkout__qr-note" style={{ marginTop: 0 }}>
                        Transfiere {amountText} a nombre de <strong>{PAYMENT_HOLDER}</strong>:
                    </p>
                    <div className="payment__accounts">
                        {BANK_ACCOUNTS.map(a => (
                            <div key={a.number} className="payment__account">
                                <div>
                                    <div className="payment__account-bank">{a.bank}</div>
                                    <div className="payment__account-type">{a.type}</div>
                                    <div className="payment__account-number">{a.number}</div>
                                </div>
                                <CopyButton text={a.number} />
                            </div>
                        ))}
                    </div>
                </>
            )}
            <p className="payment__receipt-note">
                📲 Después de pagar, envía tu comprobante por WhatsApp al <strong>{RECEIPT_PHONE}</strong>.
            </p>
        </div>
    )
}

// Lista de métodos de pago + instrucciones del elegido
export default function PaymentMethods({ options, value, onChange, amount }) {
    return (
        <>
            <div className="checkout__payment-options">
                {options.map(m => (
                    <button
                        type="button"
                        key={m.value}
                        disabled={m.disabled}
                        onClick={() => onChange(m.value)}
                        className={`checkout__payment-option${value === m.value ? ' checkout__payment-option--active' : ''}${m.disabled ? ' checkout__payment-option--disabled' : ''}`}
                    >
                        <span className="checkout__payment-option-icon">{m.icon}</span>
                        <span className="checkout__payment-option-label">{m.label}</span>
                        {m.badge && <span className="checkout__payment-option-badge">{m.badge}</span>}
                    </button>
                ))}
            </div>
            <PrepaidDetails method={value} amount={amount} />
        </>
    )
}
