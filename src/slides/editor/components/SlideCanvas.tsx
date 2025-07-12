import { h } from 'preact';
import { Slide, ElementPositioning, ContentElement } from '../../models';
import {JSX} from "preact/compat";
import { useState, useEffect, useMemo } from 'preact/hooks';
import useElementSize from '../../utils/useElementSize';
import {InputElement as InputElementType, InputValues} from "../../models";
import {ContentElementRenderer} from "../../components/ContentElementRenderer.tsx";
import {ThemeTokens, znui} from "@znui/react";

interface SlideCanvasProps {
    slide: Slide;
    selectedElementId: string | null;
    onSelectElement: (elementId: string | null) => void;
    onUpdateElementPositioning: (elementId: string, newPositioning: ElementPositioning) => void;
    canvasWidth: number;  // Ширина контентной области слайда из его настроек
    canvasHeight: number; // Высота контентной области слайда
}

// Это очень упрощенный холст. Реальный потребует больше логики для масштабирования, панорамирования,
// точного позиционирования относительно масштаба.
export const SlideCanvas = ({
                         slide,
                         selectedElementId,
                         onSelectElement,
                         onUpdateElementPositioning,
                         canvasWidth,
                         canvasHeight
                     }: SlideCanvasProps) => {
    const [inputValues, setInputValues] = useState<InputValues>({});

    useEffect(() => {
        const initialValues: InputValues = {};
        slide.elements.forEach(element => {
            if (element.type === 'input') {
                const inputEl = element as InputElementType;
                initialValues[inputEl.id] = inputEl.defaultValue;
            }
        });
        setInputValues(initialValues);
    }, [slide]);

    const [wrapperRef, wrapperSize] = useElementSize<HTMLDivElement>(); // Хук для измерения обертки

    const displayScale = useMemo(() => {
        if (wrapperSize.width === 0 || wrapperSize.height === 0 || canvasWidth === 0 || canvasHeight === 0) {
            return 1; // Начальное значение или если размеры еще не определены
        }
        // Масштабируем, чтобы вписать canvasWidth/Height в wrapperSize.width/Height
        // Учитываем небольшой padding внутри wrapper, если он есть
        const padding = 20; // Например, 10px с каждой стороны
        const availableWidth = wrapperSize.width - padding;
        const availableHeight = wrapperSize.height - padding;

        return Math.min(1, availableWidth / canvasWidth, availableHeight / canvasHeight);
    }, [wrapperSize, canvasWidth, canvasHeight]);

    // `slide-canvas-wrapper` должен растягиваться на все доступное пространство
    // которое ему дает `center-panel` (после `ElementToolbox`).
    const canvasWrapperStyle: JSX.CSSProperties = {
        width: '100%',         // Занять всю ширину родителя (center-panel)
        flexGrow: 1,           // Занять все оставшееся вертикальное пространство родителя
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // border: '2px solid orange', // DEBUG: Границы обертки
        overflow: 'hidden',    // Важно, чтобы масштабированный холст не вылезал
        minHeight: '200px',    // Минимальная высота, чтобы было куда вписывать
        padding: '10px',       // Отступы внутри обертки, чтобы холст не прилипал к краям
        boxSizing: 'border-box',
    };

    // Сам холст, который будет масштабироваться внутри canvasWrapperStyle
    const actualCanvasStyle: JSX.CSSProperties = {
        width: `${canvasWidth}px`, // Дизайнерские размеры
        height: `${canvasHeight}px`,
        minWidth: `${canvasWidth}px`,
        minHeight: `${canvasHeight}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        position: 'relative',
        overflow: 'hidden', // Обрезать элементы, выходящие за дизайнерские границы холста
        transformOrigin: 'center center', // Масштабировать от центра
        transform: `scale(${displayScale})`,
        // boxShadow: '0 0 10px rgba(0,0,0,0.2)', // Для визуального выделения
    };

    const handleCanvasClick = (e: MouseEvent) => {
        // Снять выделение, если клик не по элементу
        if (e.target === e.currentTarget) {
            onSelectElement(null);
        }
    };

    return (
        // Этот div (canvasWrapper) будет измерен хуком useElementSize
        <div ref={wrapperRef} class="slide-canvas-wrapper" style={canvasWrapperStyle}>
            {/* А этот div (actualCanvas) будет отмасштабирован внутри него */}
            <div class="slide-actual-canvas" style={actualCanvasStyle} onClick={handleCanvasClick}>
                {slide.elements.map(element => (
                    // <DraggableResizableElement
                    //     key={element.id}
                    //     elementId={element.id!}
                    //     initialPositioning={element.positioning || {}}
                    //     isSelected={element.id === selectedElementId}
                    //     onSelect={() => onSelectElement(element.id!)}
                    //     onUpdate={() => {}}
                    //     // canvasScale - это масштаб, с которым actualCanvas отображается.
                    //     // DraggableResizableElement использует его для коррекции координат мыши.
                    //     canvasScale={displayScale}
                    //     parentWidth={canvasWidth}   // Дизайнерская ширина холста
                    //     parentHeight={canvasHeight}  // Дизайнерская высота холста
                    //     boundary={{ width: canvasWidth, height: canvasHeight }}
                    // >
                    <ContentElementRenderer
                        element={element}
                        inputValues={inputValues}
                        onInputChange={() => {}}
                        scaleFactor={1}
                        usePositioning={true}
                        onClick={() =>  onSelectElement(element.id!)}
                        borderStyle="solid"
                        boxSizing="border-box"
                        to={{
                            borderColor: element.id === selectedElementId ? ThemeTokens.tertiary: ThemeTokens.outlineVariant,
                            borderWidth: element.id === selectedElementId ? 2: 1
                        }}
                    />
                    // </DraggableResizableElement>
                ))}
            </div>
        </div>
    );
};
