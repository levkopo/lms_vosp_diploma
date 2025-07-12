import { useEffect, useState, useCallback } from 'preact/hooks';

/**
 * Хук для отслеживания последовательности нажатий клавиш (чит-кода).
 *
 * @param sequence - Массив строк, представляющих ожидаемую последовательность клавиш (e.g., ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'a', 'b']).
 *                   Используйте значения `event.key` для клавиш.
 * @param callback - Функция, которая будет вызвана при успешном вводе последовательности.
 * @param options - Опциональные настройки.
 * @param options.timeout - Максимальное время (в мс) между нажатиями клавиш. Если превышено, последовательность сбрасывается. По умолчанию 1000 мс.
 * @param options.target - DOM-элемент, на котором слушать события. По умолчанию `document.body`.
 */
export const useKonamiCode = (
    sequence: string[],
    callback: () => void,
    options?: { timeout?: number; target?: HTMLElement | Document | Window }
): void => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastKeyPressTime, setLastKeyPressTime] = useState<number | null>(null);

    const { timeout = 1000, target = typeof window !== 'undefined' ? document.body : undefined } = options || {};

    const resetSequence = useCallback(() => {
        setCurrentIndex(0);
        setLastKeyPressTime(null);
        // console.log('Konami sequence reset.'); // Для отладки
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (sequence.length === 0) return;

            const currentTime = Date.now();

            // Проверка таймаута между нажатиями
            if (lastKeyPressTime && currentTime - lastKeyPressTime > timeout) {
                // console.log('Konami timeout exceeded.'); // Для отладки
                resetSequence();
                // Начинаем заново с текущей клавиши, если она первая в последовательности
                if (event.key.toLowerCase() === sequence[0].toLowerCase()) {
                    setCurrentIndex(1);
                    setLastKeyPressTime(currentTime);
                    // console.log(`Konami progress: ${event.key} (1/${sequence.length})`); // Для отладки
                }
                return;
            }

            const expectedKey = sequence[currentIndex].toLowerCase();
            const pressedKey = event.key.toLowerCase();

            console.log(`Pressed: ${pressedKey}, Expected: ${expectedKey}, Index: ${currentIndex}`); // Для отладки

            if (pressedKey === expectedKey) {
                if (currentIndex === sequence.length - 1) {
                    // Последовательность завершена
                    // console.log('Konami code activated!'); // Для отладки
                    callback();
                    resetSequence();
                } else {
                    // Продвигаемся по последовательности
                    setCurrentIndex(prevIndex => prevIndex + 1);
                    setLastKeyPressTime(currentTime);
                    // console.log(`Konami progress: ${pressedKey} (${currentIndex + 1}/${sequence.length})`); // Для отладки
                }
            } else {
                // Неправильная клавиша, сброс (или сброс, если нажатая клавиша не является началом новой последовательности)
                // Для строгого сброса:
                // resetSequence();
                // Для более мягкого сброса (позволяет начать заново, если первая клавиша верна):
                if (pressedKey === sequence[0].toLowerCase()) {
                    setCurrentIndex(1);
                    setLastKeyPressTime(currentTime);
                } else {
                    resetSequence();
                }
            }
        },
        [sequence, callback, currentIndex, lastKeyPressTime, timeout, resetSequence]
    );

    useEffect(() => {
        if (!target) return;

        const eventTarget = target as HTMLElement; // Убедимся, что это HTMLElement для addEventListener

        // Приведение типа для KeyboardEvent
        const listener = (event: Event) => handleKeyDown(event as KeyboardEvent);

        eventTarget.addEventListener('keydown', listener);

        return () => {
            eventTarget.removeEventListener('keydown', listener);
        };
    }, [handleKeyDown, target]); // Добавляем target в зависимости, если он может меняться
};