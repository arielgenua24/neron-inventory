/**
 * Utilidades para formateo de datos
 */

/**
 * Formatea un CUIT string a XX-XXXXXXXX-X
 * Si ya tiene formato, lo limpia y lo vuelve a aplicar
 */
export const formatCUIT = (cuit: string): string => {
    const clean = cuit.replace(/\D/g, '');
    if (clean.length !== 11) return cuit; // Retornar original si no tiene la longitud correcta

    return `${clean.substring(0, 2)}-${clean.substring(2, 10)}-${clean.substring(10)}`;
};
