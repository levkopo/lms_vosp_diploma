import {ContentElement, InputValues} from '../models';
import {LinearGraphElementDisplay, InputElementDisplay, ImageElementDisplay, TextElementDisplay} from "./elements";
import {JSX} from 'preact/jsx-runtime';
import {scalePositioning} from "../utils/styleUtils.ts";
import {HTMLZnUIProps, znui} from "@znui/react";
import {TableElementDisplay} from "./elements/TableElementDisplay.tsx";

interface ContentElementRendererProps extends HTMLZnUIProps<"div"> {
    element: ContentElement;
    inputValues: InputValues;
    onInputChange: (inputId: string, value: string | number) => void;
    scaleFactor: number;
    usePositioning?: boolean;
}

export const ContentElementRenderer = (props: ContentElementRendererProps) => {
    const {
        element,
        inputValues,
        onInputChange,
        scaleFactor,
        usePositioning = true,
        ...rest
    } = props

    let renderedElement: JSX.Element | null = null;

    // Pass scaleFactor to all child element displays
    switch (element.type) {
        case 'text':
            renderedElement =
                <TextElementDisplay element={element} inputValues={inputValues} scaleFactor={scaleFactor}/>;
            break;
        case 'image':
            renderedElement = <ImageElementDisplay element={element} scaleFactor={scaleFactor}/>;
            break;
        case 'input':
            renderedElement = (
                <InputElementDisplay
                    element={element}
                    value={inputValues[element.id] !== undefined ? inputValues[element.id] : element.defaultValue}
                    onChange={onInputChange}
                    scaleFactor={scaleFactor}
                />
            );
            break;
        case 'linearGraph':
            renderedElement = <LinearGraphElementDisplay element={element} inputValues={inputValues} scaleFactor={scaleFactor}/>;
            break;
        case 'table':
            renderedElement = <TableElementDisplay element={element} inputValues={inputValues} scaleFactor={scaleFactor}/>;
            break;
        default:
            console.warn('Unknown element type:', (element as any).type);
            renderedElement = <p>Unsupported element type: {(element as any).type}</p>;
    }

    if (element.positioning && usePositioning) {
        const scaledPos = scalePositioning(element.positioning, scaleFactor);

        const positioningStyles: JSX.CSSProperties = {
            position: 'absolute',
            // Use scaled values. Fallback to original if scaling returns undefined (e.g. for 'auto')
            top: scaledPos?.top !== undefined ? scaledPos.top : element.positioning.top,
            left: scaledPos?.left !== undefined ? scaledPos.left : element.positioning.left,
            right: scaledPos?.right !== undefined ? scaledPos.right : element.positioning.right,
            bottom: scaledPos?.bottom !== undefined ? scaledPos.bottom : element.positioning.bottom,
            width: scaledPos?.width !== undefined ? scaledPos.width : element.positioning.width,
            height: scaledPos?.height !== undefined ? scaledPos.height : element.positioning.height,
            zIndex: element.positioning.zIndex, // zIndex is not scaled
            boxSizing: 'border-box',
        };

        // Filter out undefined style properties that might result from 'auto' or unscaled values
        Object.keys(positioningStyles).forEach(keyStr => {
            const key = keyStr as keyof JSX.CSSProperties;
            if (positioningStyles[key] === undefined) {
                delete positioningStyles[key];
            }
        });

        return <znui.div
            style={positioningStyles}
            {...rest}
        >{renderedElement}</znui.div>;
    }

    return renderedElement;
};