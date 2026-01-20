export const formatNorwegianPhoneNumber = (value: string | null | undefined): string => {
    if (!value) return "";

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Check if it's an 8-digit number (typical Norwegian mobile/landline)
    if (cleaned.length === 8) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }

    // If it starts with 47 (Norway country code) and keeps length
    if (cleaned.startsWith('47') && cleaned.length === 10) {
        return `+47 ${cleaned.substring(2).replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
    }

    // Fallback: return original if it doesn't match standard 8-digit pattern
    return value;
};
