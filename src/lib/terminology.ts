import { EventType } from "@prisma/client";

export const getEventTerm = (type: EventType | undefined) => {
    switch (type) {
        case 'WEDDING': return "Bryllup";
        case 'CHRISTENING': return "Dåp";
        case 'NAMING_CEREMONY': return "Navnefest";
        case 'CONFIRMATION': return "Konfirmasjon";
        case 'JUBILEE': return "Jubileum";
        default: return "Arrangement";
    }
};

export const getGuestTerm = (type: EventType | undefined) => {
    switch (type) {
        case 'WEDDING': return "Gjest";
        case 'CHRISTENING': return "Gudforelder/Gjest";
        default: return "Deltaker";
    }
};
