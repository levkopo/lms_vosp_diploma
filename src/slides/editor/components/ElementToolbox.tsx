import { h } from 'preact';
import { ContentElement } from '../../models';
import { JSX } from 'preact/jsx-runtime';
import {HStack, IconButton, ThemeTokens} from "@znui/react";
import {MdOutlineTextFields, MdImage, MdInput, MdAutoGraph} from "react-icons/md";

interface ElementToolboxProps {
    onAddElement: (type: ContentElement['type']) => void;
}

export const ElementToolbox = ({ onAddElement }: ElementToolboxProps): JSX.Element => {
    // Типы элементов, которые можно добавить
    const elementTypes: { label: string; type: ContentElement['type'], icon: JSX.Element }[] = [
        { label: 'Текст', type: 'text', icon: <MdOutlineTextFields/> },
        { label: 'Изображение', type: 'image', icon: <MdImage/> },
        { label: 'Поле ввода', type: 'input', icon: <MdInput/> },
        { label: 'Линейный график', type: 'linearGraph', icon: <MdAutoGraph/> },
    ];

    return (
        <HStack
            bottom={12}
            pos='fixed'
            background={ThemeTokens.tertiaryContainer}
            borderStyle="solid"
            borderWidth={0}
            shapeScale="full"
            gap={8}
            zIndex={1000}
            padding={12}
        >
            {elementTypes.map(elType => (
                <IconButton
                    key={elType.type}
                    onClick={() => onAddElement(elType.type)}
                >
                    {elType.icon}
                </IconButton>
            ))}
        </HStack>
    );
};

export default ElementToolbox;