import {InputValues, TextElement} from "../../models";
import {scaleCssValue} from "../../utils/styleUtils.ts";
import {JSX} from "preact/compat";
import {ThemeTokens, znui} from "@znui/react";

const processTextContent = (content: string, inputValues: InputValues): string => {
    return content.replace(/\{\{([\w-]+)\}\}/g, (match, inputId) => {
        return String(inputValues[inputId] !== undefined ? inputValues[inputId] : match);
    });
};

interface TextElementDisplayProps {
    element: TextElement;
    inputValues: InputValues;
    scaleFactor: number
}

const PlusSpan = znui("span", {
    baseStyle: {
        bg: "green",
        c: "white",
        shapeScale: "full",
        display: "inline-flex",
        justify: "center",
        align: "center",
        textAlign: "center",
        lineHeight: 1
    }
})

const MinusSpan = znui("span", {
    baseStyle: {
        bg: ThemeTokens.error,
        c: ThemeTokens.onError,
        shapeScale: "full",
        display: "inline-flex",
        justify: "center",
        align: "center",
        textAlign: "center",
        lineHeight: 1
    }
})

export const TextElementDisplay= ({ element, inputValues, scaleFactor }: TextElementDisplayProps) => {
    const processedContent = processTextContent(element.content, inputValues);

    const textStyle: JSX.CSSProperties = {
        margin: `${scaleCssValue('10px', scaleFactor)} 0`,
        fontSize: element.fontSize ? scaleCssValue(element.fontSize, scaleFactor) : scaleCssValue('16px', scaleFactor),
        lineHeight: element.fontSize ? scaleCssValue(element.fontSize, scaleFactor * 1.2) : scaleCssValue('17px', scaleFactor),
        fontWidth: element.fontWidth ?? 400,
    };

    return <div style={textStyle}>{
        processedContent.split('\n').map((line, lineIndex) => (
            <div key={lineIndex}>
                {line.startsWith("[+]") && <PlusSpan
                    layoutSize={textStyle.fontSize}
                    fontSize={"calc("+textStyle.fontSize+" - 4px)"}
                >
                    +
                </PlusSpan>}
                {line.startsWith("[-]") && <MinusSpan
                    layoutSize={textStyle.fontSize}
                    fontSize={"calc("+textStyle.fontSize+" - 4px)"}
                >-</MinusSpan>}
                {line.replaceAll(/(\[-]|\[\+])/g, '').split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
                {lineIndex < processedContent.split('\n').length - 1 && <br />}
            </div>
        ))
    }</div>;
};