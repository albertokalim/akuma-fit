/**
 * Traduce un mensaje de error de Supabase Auth a un texto legible en español.
 * Si el mensaje no coincide con ningún caso conocido (o está vacío), devuelve
 * un mensaje genérico.
 *
 * @param {string} message - Mensaje de error original de Supabase.
 * @returns {string} Mensaje traducido para mostrar al usuario.
 */
export function translateSupabaseAuthError(message) {
    if (!message) {
        return 'No se pudo completar la operación. Inténtalo de nuevo más tarde.';
    }

    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('invalid login credentials')) {
        return 'El correo electrónico o la contraseña no son correctos.';
    }

    if (normalizedMessage.includes('email not confirmed')) {
        return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
    }

    if (normalizedMessage.includes('already registered') || normalizedMessage.includes('already been registered')) {
        return 'Este correo electrónico ya está registrado.';
    }

    if (normalizedMessage.includes('email') && (normalizedMessage.includes('invalid') || normalizedMessage.includes('format'))) {
        return 'El correo electrónico introducido no tiene un formato válido.';
    }

    if (normalizedMessage.includes('password') && normalizedMessage.includes('should be at least')) {
        return 'La contraseña no cumple los requisitos mínimos de seguridad.';
    }

    if (normalizedMessage.includes('password') && (normalizedMessage.includes('weak') || normalizedMessage.includes('breach') || normalizedMessage.includes('pwned'))) {
        return 'La contraseña es demasiado insegura o ha aparecido en alguna filtración de datos conocida. Elige otra distinta.';
    }

    if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('too many requests')) {
        return 'Se han realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
    }

    if (normalizedMessage.includes('network') || normalizedMessage.includes('fetch')) {
        return 'No se pudo conectar con el servidor. Comprueba tu conexión a internet e inténtalo de nuevo.';
    }

    return 'No se pudo completar la operación. Inténtalo de nuevo más tarde.';
}
