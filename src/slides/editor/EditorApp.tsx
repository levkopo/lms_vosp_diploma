import {h} from 'preact';
import {useState, useEffect, useCallback, useRef, Inputs} from 'preact/hooks';
import {Slide, ContentElement, ElementPositioning} from '../models';
import {generateId} from '../utils/idUtils';
import {Toolbar} from './components/Toolbar';
import {SlideList} from './components/SlideList';
import {SlideCanvas} from './components/SlideCanvas';
import {ElementToolbox} from './components/ElementToolbox';
import {PropertyInspector} from './components/PropertyInspector';
import {DESIGN_WIDTH, DESIGN_HEIGHT} from '../constants.ts';
import {IconButton, Layout, ListItem, ThemeTokens, VStack} from "@znui/react";
import {LecturePlayer} from "../components/LecturePlayer.tsx";
import {MdClose} from "react-icons/md";
import {usePersistentCallback} from "../utils/usePersistentCallback.ts";

const initialSlides: Slide[] = [
    {id: generateId('slide'), elements: []},
];

export const EditorApp = () => {
    const [slides, setSlides] = useState<Slide[]>(initialSlides);
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(slides[0]?.id || null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isShowPreview, setShowPreview] = useState<boolean>(false);

    const selectedSlide = slides.find(s => s.id === selectedSlideId);
    const selectedElement = selectedSlide?.elements.find(el => el.id === selectedElementId);

    // --- Функции для слайдов ---
    const addSlide = useCallback(() => {
        const newSlide: Slide = {
            id: generateId('slide'),
            elements: []
        };

        setSlides(prev => [...prev, newSlide]);
        setSelectedSlideId(newSlide.id);
        setSelectedElementId(null);
    }, [setSlides, setSelectedSlideId, setSelectedElementId]);

    const deleteSlide = useCallback((slideId: string) => {
        setSlides(prev => {
            return prev.filter(s => s.id !== slideId);
        });

        setSelectedSlideId(prev => prev === slideId ? (slides.find(s => s.id !== slideId)?.id || null) : prev);
        setSelectedElementId(null);
    }, [setSlides, setSelectedSlideId, setSelectedElementId]);


    // --- Функции для элементов ---
    const addElement = usePersistentCallback((type: ContentElement['type']) => {
        if (!selectedSlideId) return;

        const newElementBase = {
            id: generateId(type),
            positioning: {
                top: '50px',
                left: '50px',
                width: '200px',
                height: '100px',
                zIndex: (selectedSlide?.elements.length || 0) + 1
            }, // Начальные значения
        };
        let newElement: ContentElement;

        switch (type) {
            case 'text':
                newElement = {...newElementBase, type: 'text', content: 'Новый текст', fontSize: '24px'};
                break;
            case 'image':
                newElement = {
                    ...newElementBase,
                    type: 'image',
                    url: 'https://via.placeholder.com/150',
                    altText: 'placeholder'
                };
                break;
            case 'input':
                newElement = {
                    ...newElementBase,
                    type: 'input',
                    inputType: "text",
                    defaultValue: "test",
                    label: "label",
                };
                break;
            case 'linearGraph':
                newElement = {
                    ...newElementBase,
                    "type": "linearGraph",
                    "caption": "График функции y = a*x + b",
                    "xAxisLabel": "x",
                    "yAxisLabel": "y",
                    "domain": {"min": -10, "max": 10},
                    "range": {"min": -90, "max": 90},
                    "formulaParameters": {
                        "formula": "a*x + b",
                        "variables": [
                            {"name": "a", "inputId": "coeffA"},
                            {"name": "b", "inputId": "coeffB"}
                        ]
                    }
                };
                break;
            // Добавить другие типы элементов (Input, LinearGraph)
            default:
                console.error('Неизвестный тип элемента:', type);
                return;
        }

        setSlides(prev => prev.map(s =>
            s.id === selectedSlideId ? {...s, elements: [...s.elements, newElement]} : s
        ));
        setSelectedElementId(newElement.id);
    }, [setSlides, setSelectedElementId]);

    const updateElement = usePersistentCallback((elementId: string, updates: Partial<ContentElement>) => {
        if (!selectedSlideId) return;

        setSlides(prev => prev.map(s =>
            s.id === selectedSlideId
                ? {...s, elements: s.elements.map(el => el.id === elementId ? {...el, ...updates} : el)}
                : s
        ) as Slide[]);
    }, [setSlides]);

    const updateElementPositioning = usePersistentCallback((elementId: string, newPositioning: ElementPositioning) => {
        updateElement(elementId, {positioning: newPositioning});
    }, [updateElement]);

    const deleteElement = usePersistentCallback((elementId: string) => {
        if (!selectedSlideId) return;
        setSlides(prev => prev.map(s =>
            s.id === selectedSlideId
                ? {...s, elements: s.elements.filter(el => el.id !== elementId)}
                : s
        ));
        if (selectedElementId === elementId) setSelectedElementId(null);
    }, [setSlides, setSelectedElementId]);

    const handleSelectElement = usePersistentCallback((elementId: string | null) => {
        setSelectedElementId(elementId);
    }, [setSelectedElementId]);

    // Загрузка / Сохранение
    const handleLoadSlides = usePersistentCallback((loadedSlides: Slide[]) => {
        setSlides(loadedSlides);
        setSelectedSlideId(loadedSlides[0]?.id || null);
        setSelectedElementId(null);
    }, [setSlides, setSelectedSlideId, setSelectedElementId])

    const handleSaveLesson = usePersistentCallback(() => {
        const json = JSON.stringify(slides, null, 2);
        console.log(json);
	navigator.clipboard.writeText(json)
    }, [slides]);

    useEffect(() => {
        if (selectedSlideId && !slides.find(s => s.id === selectedSlideId)) {
            setSelectedSlideId(slides[0]?.id || null);
            setSelectedElementId(null);
        }
    }, [slides, selectedSlideId]);

    return (
        <div class="editor-app" style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            {isShowPreview && <Layout
                pos="fixed"
                posA={0}
                bg="white"
                zIndex={10000}
            >
                <IconButton
                    position="absolute"
                    top={24}
                    left={24}
                    onClick={() => {
                        setShowPreview(false)
                    }}
                >
                    <MdClose/>
                </IconButton>

                <LecturePlayer slides={slides} startFromSlide={selectedSlideId} onFinish={() => {
                    setShowPreview(false)
                }}/>
            </Layout>}

            <Toolbar
                onLoad={handleLoadSlides}
                onSave={handleSaveLesson}
                onNew={() => setSlides(initialSlides)}
                onShowPreview={() => {
                    setShowPreview (true)
                }}
            />

            <div style={{display: 'flex', flexGrow: 1, overflow: 'hidden'}}>
                {/* Левая панель: Свойства урока и Список слайдов */}
                <VStack
                    class="left-panel"
                    minW={250}
                    w={250}
                    bg={ThemeTokens.surfaceContainer}
                    ph={12}
                    pv={8}
                    overflowY="auto">
                    <SlideList
                        slides={slides}
                        selectedSlideId={selectedSlideId}
                        onSelectSlide={setSelectedSlideId}
                        onAddSlide={addSlide}
                        onDeleteSlide={deleteSlide}
                    />
                </VStack>

                {/* Центральная панель: Холст и Инструменты */}
                <div class="center-panel" style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px',
                    overflow: 'auto',
                    position: "relative"
                }}>
                    <ElementToolbox onAddElement={addElement}/>
                    {selectedSlide && (
                        <SlideCanvas
                            key={selectedSlide.id} // Для перерисовки при смене слайда
                            slide={selectedSlide}
                            selectedElementId={selectedElementId}
                            onSelectElement={handleSelectElement}
                            onUpdateElementPositioning={updateElementPositioning}
                            canvasWidth={DESIGN_WIDTH}
                            canvasHeight={DESIGN_HEIGHT}
                        />
                    )}
                    {!selectedSlide && <p>Выберите или создайте слайд для редактирования.</p>}
                </div>

                {/* Правая панель: Инспектор Свойств */}
                <VStack
                    background={ThemeTokens.surfaceContainer}
                    w={300}
                    minW={300}
                    to={{
                        mr: selectedSlide && selectedSlide.elements.length != 0 ? 0 : -300
                    }}
                    overflowY="auto"
                >
                    {selectedElement ? <PropertyInspector
                        selectedItem={selectedElement}
                        onUpdateElement={updateElement}
                        onDeleteElement={selectedElement ? () => deleteElement(selectedElement.id!) : undefined}
                        onExit={() => setSelectedElementId(null)}
                    /> : selectedSlide && selectedSlide.elements.length != 0 && <VStack>
                        {
                            selectedSlide.elements.map((element, number) =>
                                <ListItem
                                    heading={element.id}
                                    supportText={"Тип элемента " + element.type}
                                    onClick={() => {
                                        handleSelectElement(element.id)
                                    }}
                                />
                            )
                        }
                    </VStack>}
                </VStack>
            </div>
        </div>
    );
};
