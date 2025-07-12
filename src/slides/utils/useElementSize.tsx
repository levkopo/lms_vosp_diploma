import { useState, useEffect, useRef, useCallback } from 'preact/hooks'; // Добавил useCallback
interface ElementSize {
    width: number;
    height: number;
}


// Хук теперь возвращает callback ref и размер
function useElementSize<T extends Element = Element>(): [ (instance: T | null) => void, ElementSize ] {
    // Сохраняем сам узел в ref, чтобы избежать лишних ре-рендеров из-за изменения setNode
    const nodeRef = useRef<T | null>(null);
    const [size, setSize] = useState<ElementSize>({
        width: 0,
        height: 0,
    });

    const observerRef = useRef<ResizeObserver | null>(null);

    // Callback ref, который будет присвоен элементу
    const ref = useCallback((nodeInstance: T | null) => {
        if (observerRef.current) { // Отключаем старый observer от предыдущего узла
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        nodeRef.current = nodeInstance; // Сохраняем узел

        if (nodeInstance) {
            observerRef.current = new ResizeObserver(entries => {
                if (entries[0] && entries[0].contentRect) {
                    const { width, height } = entries[0].contentRect;
                    setSize({ width, height });
                } else if (entries[0] && entries[0].target) { // Фоллбэк для старых браузеров или если contentRect нет
                    const targetEl = entries[0].target as HTMLElement;
                    setSize({width: targetEl.offsetWidth, height: targetEl.offsetHeight });
                }
            });
            observerRef.current.observe(nodeInstance);

            // Первоначальное измерение
            // Используем getBoundingClientRect для большей точности, включая дробные пиксели
            const rect = nodeInstance.getBoundingClientRect();
            setSize({ width: rect.width, height: rect.height });
        } else {
            // Узел был удален, сбрасываем размер
            setSize({ width: 0, height: 0 });
        }
    }, []); // useCallback без зависимостей, т.к. он должен быть стабильным

    return [ref, size];
}
export default useElementSize;