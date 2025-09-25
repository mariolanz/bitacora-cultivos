/**
 * Diagnóstico y predicción local (sin IA externa)
 * Puedes mejorar estas funciones con reglas, heurísticas o ML local en el futuro.
 */

import { Crop } from '../types';

// Diagnóstico local simulado
export const diagnosePlantIssue = async (base64Image: string, mimeType: string, notes: string) => {
    // Aquí puedes agregar reglas simples basadas en las notas o imágenes (no se analiza la imagen en este demo)
    let diagnosis = "No se detectaron problemas graves.";
    let overall_health_assessment = "La planta parece estar en buen estado general.";
    let preventative_tips = [
        "Mantén un riego regular y revisa el pH.",
        "Vigila signos de plagas o deficiencias."
    ];

    if (notes.toLowerCase().includes("amarill")) {
        diagnosis = "Posible deficiencia de nitrógeno (hojas amarillas).";
        overall_health_assessment = "La planta muestra signos de deficiencia nutricional.";
        preventative_tips = [
            "Ajusta la fertilización con nitrógeno.",
            "Verifica el pH del sustrato."
        ];
    } else if (notes.toLowerCase().includes("mancha")) {
        diagnosis = "Posible presencia de hongos o plagas (manchas detectadas).";
        overall_health_assessment = "Se recomienda inspección detallada.";
        preventative_tips = [
            "Revisa el envés de las hojas.",
            "Aplica tratamiento preventivo si es necesario."
        ];
    }

    return {
        diagnosis,
        overall_health_assessment,
        preventative_tips
    };
};

// Predicción de cosecha local simulada
export const predictHarvestYield = async (crop: Crop) => {
    // Puedes mejorar esta función con reglas basadas en los datos del cultivo
    const totalPlants = crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0);
    const daysInFlower = crop.flowerDate && crop.harvestDate
        ? Math.round((new Date(crop.harvestDate).getTime() - new Date(crop.flowerDate).getTime()) / (1000 * 3600 * 24))
        : 56; // default 8 semanas

    // Regla simple: 20-30g por planta por cada 7 días de floración
    const minYield = totalPlants * daysInFlower * 20 / 56;
    const maxYield = totalPlants * daysInFlower * 30 / 56;

    return {
        yield_range: `${Math.round(minYield)}g - ${Math.round(maxYield)}g`,
        reasoning: `Basado en ${totalPlants} plantas y ${daysInFlower} días de floración.`,
        confidence_level: "Simulación local (baja)"
    };
};