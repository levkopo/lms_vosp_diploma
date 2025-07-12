import {InputElement, TextInput, NumberInput, SliderInput} from '../../models';
import {ChangeEvent, JSX} from "preact/compat";
import {scaleCssValue} from "../../utils/styleUtils.ts";
import {Slider, TextField, HStack} from "@znui/react";

interface InputElementDisplayProps {
    element: InputElement;
    value: string | number;
    onChange: (inputId: string, value: string | number) => void;
    scaleFactor: number;
}

export const InputElementDisplay = (props: InputElementDisplayProps) => {
    const {element, value, onChange, scaleFactor} = props

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(
            element.id, element.inputType === 'number' || element.inputType === 'slider' ?
                parseFloat(e.currentTarget.value) : e.currentTarget.value
        );
    };

    const labelStyle: JSX.CSSProperties = {
        display: 'block',
        marginBottom: scaleCssValue('5px', scaleFactor),
        fontSize: scaleCssValue('16px', scaleFactor), // Scale label font size
    };

    const inputBaseStyle: JSX.CSSProperties = {
        transform: 'scale('+scaleFactor+')'
    };

    // Replace with actual @znui/react components and layout (e.g., FormControl, FormLabel)
    return (
        <>
            {element.inputType === 'text' && (
                <TextField
                    label={element.label}
                    type="text"
                    id={element.id}
                    value={value as string}
                    onChange={handleChange}
                    placeholder={(element as TextInput).placeholder}
                    style={inputBaseStyle}
                />
            )}
            {element.inputType === 'number' && (
                <TextField
                    label={element.label}
                    type="number"
                    id={element.id}
                    value={value as number}
                    onChange={handleChange}
                    inputProps={{
                        min: (element as NumberInput).min,
                        max: (element as NumberInput).max,
                        step: (element as NumberInput).step,
                    }}
                    style={inputBaseStyle}
                />
            )}
            {element.inputType === 'slider' && (
                <div>
                    <HStack>
			<label htmlFor={element.id} style={labelStyle}>{element.label}</label>
		    	<span style={{
                        	marginLeft: scaleCssValue('10px', scaleFactor),
                        	fontSize: scaleCssValue('14px', scaleFactor)
                    	}}>{value}</span>
		    </HStack>
                    <Slider
                        id={element.id}
                        value={value as number}
                        onChange={handleChange}
                        min={(element as SliderInput).min}
                        max={(element as SliderInput).max}
                        style={inputBaseStyle}
                        step={(element as SliderInput).step}
                    />
                </div>
            )}
        </>
    );
};
