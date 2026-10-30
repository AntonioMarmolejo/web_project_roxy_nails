// Datos para cobrar: cambiar aquí actualiza la tienda y las citas.
import qrDeuna from '../assets/qr-deuna.png'
import qrBdp from '../assets/qr-bdp.png'

export const PAYMENT_HOLDER = 'Fanny Maritza Álvarez Carvajal'

// A este número se envía el comprobante de pago
export const RECEIPT_PHONE = '0967686377'
export const receiptWhatsappUrl = (text) => `https://wa.me/593967686377?text=${encodeURIComponent(text)}`

export const BANK_ACCOUNTS = [
    { bank: 'Banco del Pacífico', type: 'Cuenta de ahorros', number: '1068218907' },
    { bank: 'Banco Pichincha',    type: 'Cuenta corriente',  number: '2100134203' },
]

// Métodos de pago por adelantado (QR o transferencia)
export const PREPAID_METHODS = {
    qr_deuna: {
        icon: '📱', label: 'QR De Una',
        qr: qrDeuna, app: 'De Una',
        // El QR de De Una es un enlace: en el celular se puede abrir directamente
        link: 'https://pagar.deuna.app/H92p/person/payment?id=a3ff48b6ddcd5d6a2dc9760474552011b53cc1d9',
    },
    qr_bdp:   { icon: '🏦', label: 'QR Banco del Pacífico', qr: qrBdp, app: 'Banco del Pacífico' },
    transfer: { icon: '🔁', label: 'Transferencia bancaria' },
}

// Nombre de cada método para mostrar en resúmenes y en el admin
export const PAYMENT_LABELS = {
    local:    'En el local',
    cod:      'En tienda / al retirar',
    qr_deuna: 'QR De Una',
    qr_bdp:   'QR Banco del Pacífico',
    transfer: 'Transferencia bancaria',
    stripe:   'Tarjeta',
}

export const isPrepaid = (method) => method in PREPAID_METHODS
