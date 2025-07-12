// src/components/editor/Toolbar.tsx
import {h} from 'preact';
import {Slide} from '../../models';
import {JSX} from 'preact/jsx-runtime';
import {HStack, IconButton, ThemeTokens} from "@znui/react";
import {MdAdd, MdArrowBack, MdFileOpen, MdSave, MdPreview} from "react-icons/md";
import {useNavigate} from "react-router";

interface ToolbarProps {
    onNew: () => void;
    onLoad: (slides: Slide[]) => void;
    onSave: () => void;
    onShowPreview: () => void;
}

export const Toolbar = ({onNew, onLoad, onSave, onShowPreview}: ToolbarProps): JSX.Element => {
    const navigate = useNavigate()

    const handleFileLoad = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = e.target?.result as string;
                    const loadedSlides = JSON.parse(json) as Slide[];
                    if (loadedSlides && Array.isArray(loadedSlides)) {
                        onLoad(loadedSlides);
                    } else {
                        alert('Ошибка: Загруженный файл не является .');
                    }
                } catch (error) {
                    console.error('Ошибка при парсинге файла слайдов:', error);
                    alert(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : String(error)}`);
                }
            };
            reader.readAsText(file);
            event.currentTarget.value = '';
        }
    };

    return (
        <HStack align='center' background={ThemeTokens.surfaceContainerHighest} class="toolbar" gap={10} p={10}>
            <input id="upload" type="file" accept=".json" onChange={handleFileLoad} style={{display: 'none'}}/>
            <IconButton onClick={() => {
                navigate("/lessons")
            }}>
                <MdArrowBack/>
            </IconButton>

            <IconButton onClick={onNew}>
                <MdAdd/>
            </IconButton>

            <IconButton onClick={() => {
                document.getElementById("upload").click()
            }}>
                <MdFileOpen/>
            </IconButton>

            <IconButton onClick={onSave}>
                <MdSave/>
            </IconButton>

            <IconButton onClick={onShowPreview}>
                <MdPreview />
            </IconButton>
        </HStack>
    );
};
