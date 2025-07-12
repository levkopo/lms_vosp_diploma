export const generateId = (prefix: string = 'id'): string => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
};