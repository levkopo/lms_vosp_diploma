import {useState, useEffect, useCallback} from 'preact/hooks';
import {ContentElementRenderer} from './ContentElementRenderer.tsx';
import {InputElement as InputElementType, InputValues, Slide} from '../models';
import {CSSProperties} from "preact/compat";
import {scaleCssValue} from "../utils/styleUtils.ts";

interface SlideDisplayProps {
    slide: Slide;
    scaleFactor: number;
}

export const SlideDisplay = ({slide, scaleFactor}: SlideDisplayProps) => {
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

    const handleInputChange = useCallback((inputId: string, value: string | number) => {
        setInputValues(prev => ({ ...prev, [inputId]: value }));
    }, []);

    const slideRootStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
    };

    const flowElements = slide.elements.filter(el => !el.positioning);
    const positionedElements = slide.elements.filter(el => !!el.positioning);


    return (
        <div style={slideRootStyle}>
            <div style={{padding: scaleCssValue('10px', scaleFactor)}}>
                {flowElements.map((element, index) => (
                    <ContentElementRenderer
                        key={element.id || `${element.type}-flow-${index}`}
                        element={element}
                        inputValues={inputValues}
                        onInputChange={handleInputChange}
                        scaleFactor={scaleFactor}
                    />
                ))}
            </div>

            {positionedElements.map((element, index) => (
                <ContentElementRenderer
                    key={element.id || `${element.type}-positioned-${index}`}
                    element={element}
                    inputValues={inputValues}
                    onInputChange={handleInputChange}
                    scaleFactor={scaleFactor}
                />
            ))}
        </div>
    );
};