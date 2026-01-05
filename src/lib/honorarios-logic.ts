/**
 * Lógica de negocio para el manejo inteligente de honorarios
 * Algoritmo: Los honorarios se propagan automáticamente a meses futuros
 * hasta que se actualicen con un nuevo valor
 */

import { MonthlyRecords, MonthKey, MONTHS } from './types';

/**
 * Obtener el honorario para un mes específico
 * Si no existe, busca el último valor registrado en meses anteriores
 */
export const getHonorarioForMonth = (
    monthlyRecords: MonthlyRecords,
    year: number,
    month: MonthKey
): number => {
    // Primero verificar si existe el registro exacto
    if (monthlyRecords[year]?.[month]) {
        return monthlyRecords[year][month]!.amount;
    }

    // Si no existe, buscar el último valor registrado
    const lastAmount = findLastRecordedAmount(monthlyRecords, year, month);
    return lastAmount ?? 0;
};

/**
 * Obtener el estado de pago para un mes específico
 */
export const getPaidStatusForMonth = (
    monthlyRecords: MonthlyRecords,
    year: number,
    month: MonthKey
): boolean => {
    return monthlyRecords[year]?.[month]?.paid ?? false;
};

/**
 * Actualizar el honorario de un mes específico
 * Este método NO propaga automáticamente, solo guarda el valor explícito
 */
export const setHonorarioForMonth = (
    monthlyRecords: MonthlyRecords,
    year: number,
    month: MonthKey,
    amount: number,
    paid: boolean = false
): MonthlyRecords => {
    const updated = { ...monthlyRecords };

    if (!updated[year]) {
        updated[year] = {};
    }

    updated[year] = {
        ...updated[year],
        [month]: { amount, paid }
    };

    return updated;
};

/**
 * Actualizar solo el estado de pago de un mes
 * Si el mes no tiene registro, crea uno usando el último honorario conocido
 */
export const setPaidStatusForMonth = (
    monthlyRecords: MonthlyRecords,
    year: number,
    month: MonthKey,
    paid: boolean
): MonthlyRecords => {
    const updated = { ...monthlyRecords };

    if (!updated[year]) {
        updated[year] = {};
    }

    // Si ya existe el registro, solo actualizar el estado
    if (updated[year][month]) {
        updated[year] = {
            ...updated[year],
            [month]: {
                ...updated[year][month]!,
                paid
            }
        };
    } else {
        // Si no existe, crear uno con el último honorario conocido
        const lastAmount = findLastRecordedAmount(monthlyRecords, year, month) ?? 0;
        updated[year] = {
            ...updated[year],
            [month]: { amount: lastAmount, paid }
        };
    }

    return updated;
};

/**
 * Buscar el último honorario registrado antes de una fecha específica
 * Esta es la función clave del algoritmo inteligente
 */
const findLastRecordedAmount = (
    monthlyRecords: MonthlyRecords,
    targetYear: number,
    targetMonth: MonthKey
): number | null => {
    const targetMonthIndex = MONTHS.indexOf(targetMonth);
    const targetScore = targetYear * 12 + targetMonthIndex;

    let bestScore = -1;
    let latestAmount: number | null = null;

    // Iterar por todos los años y meses registrados
    for (const yearStr in monthlyRecords) {
        const year = parseInt(yearStr);
        const yearRecords = monthlyRecords[year];
        if (!yearRecords) continue;

        for (const monthKey of MONTHS) {
            const record = yearRecords[monthKey];
            if (record) {
                const monthIndex = MONTHS.indexOf(monthKey);
                const currentScore = year * 12 + monthIndex;

                // Si este registro es anterior al mes objetivo y es el más reciente encontrado hasta ahora
                if (currentScore < targetScore && currentScore > bestScore) {
                    bestScore = currentScore;
                    latestAmount = record.amount;
                }
            }
        }
    }

    return latestAmount;
};

/**
 * Verificar si un mes tiene un registro explícito
 * (no heredado de meses anteriores)
 */
export const hasExplicitRecord = (
    monthlyRecords: MonthlyRecords,
    year: number,
    month: MonthKey
): boolean => {
    return !!monthlyRecords[year]?.[month];
};

/**
 * Obtener todos los meses con registros explícitos para un año
 */
export const getExplicitMonthsForYear = (
    monthlyRecords: MonthlyRecords,
    year: number
): MonthKey[] => {
    if (!monthlyRecords[year]) return [];

    return Object.keys(monthlyRecords[year]) as MonthKey[];
};

/**
 * Calcular el total de honorarios para un año completo
 */
export const getTotalForYear = (
    monthlyRecords: MonthlyRecords,
    year: number
): number => {
    let total = 0;

    for (const month of MONTHS) {
        const amount = getHonorarioForMonth(monthlyRecords, year, month);
        total += amount;
    }

    return total;
};

/**
 * Obtener estadísticas de pagos para un año
 */
export const getPaymentStats = (
    monthlyRecords: MonthlyRecords,
    year: number
): { paid: number; unpaid: number; total: number } => {
    let paid = 0;
    let unpaid = 0;

    for (const month of MONTHS) {
        const isPaid = getPaidStatusForMonth(monthlyRecords, year, month);
        if (isPaid) {
            paid++;
        } else {
            unpaid++;
        }
    }

    return { paid, unpaid, total: 12 };
};
