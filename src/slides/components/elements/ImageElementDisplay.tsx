import {ImageElement} from "../../models";
import {scaleCssValue} from "../../utils/styleUtils.ts";
import {JSX} from "preact/compat";

interface ImageElementDisplayProps {
    element: ImageElement;
    scaleFactor: number;
}

export const ImageElementDisplay = (props: ImageElementDisplayProps) => {
    const { element, scaleFactor } = props

    const containerStyle: JSX.CSSProperties = {
        margin: `${scaleCssValue('10px', scaleFactor)} 0`, // Scale margin
        textAlign: 'center',
        // If image has fixed px dimensions in JSON (not via positioning.width/height), scale them here.
        // However, usually positioning.width/height handles this.
        // width: element.width ? scaleCssValue(element.width, scaleFactor) : 'auto',
        // height: element.height ? scaleCssValue(element.height, scaleFactor) : 'auto',
    };

    const imgStyle: JSX.CSSProperties = {
        maxWidth: '100%', // Usually best to let image scale within its container
        maxHeight: '100%',// which is already scaled by positioning
        display: 'block',
        margin: '0 auto', // If it's smaller than its container
    };

    const captionStyle: JSX.CSSProperties = {
        fontSize: scaleCssValue('14px', scaleFactor), // Scale caption font size
        fontStyle: 'italic',
        marginTop: scaleCssValue('4px', scaleFactor),
    };

    return (
        <div style={containerStyle}>
            <img src={element.url} alt={element.altText || 'Lesson image'} style={imgStyle} />
            {element.caption && <p style={captionStyle}>{element.caption}</p>}
        </div>
    );
};