import {h, Fragment} from 'preact';
import {
    ContentElement,
    ElementPositioning,
    InputElement,
    TextElement,
    ImageElement,
    LinearGraphElement,
    FormulaGraphVariable
} from '../../models';
import {
    HStack,
    IconButton,
    Title,
    VStack,
    TextField,
    GridLayout,
    Divider,
    Button,
    ThemeTokens,
    Layout
} from "@znui/react";
import {MdArrowBack, MdFileOpen} from "react-icons/md";
import {useMemo} from "preact/hooks";
import {usePersistentCallback} from "../../utils/usePersistentCallback.ts";
import React from "react";

interface PropertyInspectorProps {
    selectedItem: ContentElement;
    onUpdateElement: (elementId: string, updates: Partial<ContentElement>) => void;
    onDeleteElement?: () => void;
    onExit: () => void
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

export const PropertyInspector = ({selectedItem, onUpdateElement, onDeleteElement, onExit}: PropertyInspectorProps) => {
    const handlePositionChange = usePersistentCallback((prop: keyof ElementPositioning, value: string | number) => {
        if (!selectedItem.id) return; // Не для слайда, и должен быть ID
        const currentPositioning = selectedItem.positioning || {};
        onUpdateElement(selectedItem.id, {positioning: {...currentPositioning, [prop]: value}});
    }, [onUpdateElement, selectedItem]);

    const handleInputChange = usePersistentCallback((e: Event, prop: string, subProp?: string, isNumber: boolean = false) => {
        debugger
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        let value: string | number = isNumber ? parseFloat(target.value) : target.value;
        if (isNumber && isNaN(value as number)) value = isNumber ? 0 : '';


        if (subProp) { // Для вложенных свойств, например, parameters.slope
            const currentSubObject = (selectedItem as any)[prop] || {};
            onUpdateElement(selectedItem.id, {[prop]: {...currentSubObject, [subProp]: value}} as any);
        } else {
            onUpdateElement(selectedItem.id, {[prop]: value} as any);
        }
    }, [onUpdateElement, selectedItem]);

    const commonPositioningFields = useMemo(() => (
        <VStack mt={12}>
            <Title size="small" fontWeight={600}>Позиционирование и Размеры</Title>

            <GridLayout columns={2} columnGap={8}>
                <TextField
                    variant="filled"
                    label="Top"
                    type="text"
                    value={selectedItem.positioning?.top || ''}
                    onInput={(e) => handlePositionChange('top', (e.target as HTMLInputElement).value)}
                />

                <TextField
                    variant="filled"
                    label="Left"
                    type="text"
                    value={selectedItem.positioning?.left || ''}
                    onInput={(e) => handlePositionChange('left', (e.target as HTMLInputElement).value)}
                />

                <TextField
                    variant="filled"
                    label="Right"
                    type="text"
                    value={selectedItem.positioning?.right || ''}
                    onInput={(e) => handlePositionChange('right', (e.target as HTMLInputElement).value)}
                />

                <TextField
                    variant="filled"
                    label="Bottom"
                    type="text"
                    value={selectedItem.positioning?.bottom || ''}
                    onInput={(e) => handlePositionChange('bottom', (e.target as HTMLInputElement).value)}
                />
            </GridLayout>

            <Divider mt={12} mb={8}/>

            <HStack gap={8}>
                <TextField
                    flex={1}
                    variant="filled"
                    label="Ширина"
                    type="text"
                    value={selectedItem.positioning?.width || ''}
                    onInput={(e) => handlePositionChange('width', (e.target as HTMLInputElement).value)}
                />

                <TextField
                    flex={1}
                    variant="filled"
                    label="Высота"
                    type="text"
                    value={selectedItem.positioning?.height || ''}
                    onInput={(e) => handlePositionChange('height', (e.target as HTMLInputElement).value)}
                />
            </HStack>

            <TextField
                variant="filled"
                label="Слой"
                type="text"
                value={selectedItem.positioning?.zIndex || 0}
                onInput={(e) => handlePositionChange('zIndex', parseInt((e.target as HTMLInputElement).value, 10) || 0)}
            />
        </VStack>
    ), [selectedItem.positioning]);

    const handleFormulaVariableChange = usePersistentCallback((index: number, prop: keyof FormulaGraphVariable, value: string) => {
        if (!selectedItem || selectedItem.type !== 'linearGraph' || !selectedItem.formulaParameters) return;
        const graphEl = selectedItem as LinearGraphElement;
        const updatedVariables = [...graphEl.formulaParameters.variables];
        updatedVariables[index] = {...updatedVariables[index], [prop]: value};
        onUpdateElement(graphEl.id!, {
            formulaParameters: {...graphEl.formulaParameters, variables: updatedVariables}
        });
    }, [onUpdateElement, selectedItem]);

    const addFormulaVariable = usePersistentCallback(() => {
        if (!selectedItem || selectedItem.type !== 'linearGraph') return;
        const graphEl = selectedItem as LinearGraphElement;
        const currentParams = graphEl.formulaParameters || {formula: "", variables: []};
        const newVariable: FormulaGraphVariable = {name: `var${currentParams.variables.length + 1}`, inputId: ""};
        onUpdateElement(graphEl.id!, {
            formulaParameters: {...currentParams, variables: [...currentParams.variables, newVariable]}
        });
    }, [onUpdateElement, selectedItem]);

    const removeFormulaVariable = usePersistentCallback((index: number) => {
        if (!selectedItem || selectedItem.type !== 'linearGraph' || !selectedItem.formulaParameters) return;
        const graphEl = selectedItem as LinearGraphElement;
        const updatedVariables = graphEl.formulaParameters.variables.filter((_, i) => i !== index);
        onUpdateElement(graphEl.id!, {
            formulaParameters: {...graphEl.formulaParameters, variables: updatedVariables}
        });
    }, [onUpdateElement, selectedItem]);


    return (
        <VStack
            ph={12}
        >
            <HStack pv={8} align="center" gap={8} pos="sticky" top={0} bg={ThemeTokens.surfaceContainer} zIndex={100}>
                <IconButton onClick={onExit}>
                    <MdArrowBack/>
                </IconButton>

                <Title fontWeight={700}>Свойства</Title>
            </HStack>


            {selectedItem.id && (
                <>
                    <TextField
                        label="ID элемента"
                        type="text"
                        value={selectedItem.id}
                        variant="filled"
                        readOnly
                    />

                    {commonPositioningFields}

                    <Divider mv={12}/>

                    {selectedItem.type === 'text' && (
                        <>
                            <HStack gap={8}>
                                <TextField
                                    flex={1}
                                    variant="filled"
                                    label="Размер шрифта"
                                    type="text"
                                    value={(selectedItem as TextElement).fontSize || ''}
                                    onInput={(e) => handleInputChange(e, 'fontSize')}
                                />

                                <TextField
                                    flex={1}
                                    variant="filled"
                                    label="Жирность шрифта"
                                    type="text"
                                    value={(selectedItem as TextElement).fontWidth || '400'}
                                    onInput={(e) => handleInputChange(e, 'fontWidth')}
                                />
                            </HStack>

                            <TextField
                                as="textarea"
                                variant="filled"
                                textareaProps={{
                                    minH: 300
                                } as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
                                label="Содержимое"
                                value={(selectedItem as TextElement).content}
                                onInput={(e) => handleInputChange(e, 'content')}
                            />
                        </>
                    )}
                    {selectedItem.type === 'image' && (
                        <>
                            <input
                                id="image-upload"
                                type="file"
                                accept=".png"
                                onChange={(e) => {
                                    const file = e.currentTarget.files[0]
                                    toBase64(file)
                                        .then((base64) => {
                                            onUpdateElement(selectedItem.id, { "url": base64 } as any)
                                        })
                                }}
                                style={{display: 'none'}}/>

                            <Button onClick={() => {
                                document.getElementById("image-upload").click()
                            }} icon={<MdFileOpen/>} variant="tonal" mb={12}>
                                Загрузить изображение
                            </Button>

                            <TextField
                                as="textarea"
                                variant="filled"
                                label="Подпись при наведении"
                                value={(selectedItem as ImageElement).altText}
                                onInput={(e) => handleInputChange(e, 'altText')}
                            />

                            <TextField
                                as="textarea"
                                variant="filled"
                                label="Подпись"
                                value={(selectedItem as ImageElement).caption}
                                onInput={(e) => handleInputChange(e, 'caption')}
                            />
                        </>
                    )}
                    {selectedItem.type === 'input' && ( // Предполагаем, что это InputElement (общий)
                        <>
                            <TextField
                                variant="filled"
                                label="Подпись"
                                type="text"
                                value={(selectedItem as InputElement).label}
                                onInput={(e) => handleInputChange(e, 'label')}
                            />

                            <TextField
                                as="textarea"
                                variant="filled"
                                label="Стандартное значение"
                                value={(selectedItem as InputElement).defaultValue}
                                onInput={(e) => handleInputChange(e, 'defaultValue')}
                            />

                            {/* Добавить поля для min, max, step, placeholder в зависимости от inputType */}
                        </>
                    )}
                    {selectedItem.type === 'linearGraph' && (
                        <>
                            <h4>Параметры Графика</h4>
                            {/* Переключатель или выбор между legacy и formula */}
                            <label>Формула (например, "a*x + b"):
                                <input
                                    type="text"
                                    value={(selectedItem as LinearGraphElement).formulaParameters?.formula || ''}
                                    onInput={(e) => {
                                        const currentParams = (selectedItem as LinearGraphElement).formulaParameters || {
                                            formula: "",
                                            variables: []
                                        };
                                        onUpdateElement(selectedItem.id!, {
                                            formulaParameters: {
                                                ...currentParams,
                                                formula: (e.target as HTMLInputElement).value
                                            }
                                        })
                                    }}
                                />
                            </label>
                            <h5>Переменные формулы:</h5>
                            {(selectedItem as LinearGraphElement).formulaParameters?.variables.map((variable, index) => (
                                <div key={index}
                                     style={{border: '1px solid #eee', padding: '5px', marginBottom: '5px'}}>
                                    <label>Имя в формуле:
                                        <input type="text" value={variable.name}
                                               onInput={(e) => handleFormulaVariableChange(index, 'name', (e.target as HTMLInputElement).value)}/>
                                    </label>
                                    <label>ID инпута:
                                        <input type="text" value={variable.inputId}
                                               onInput={(e) => handleFormulaVariableChange(index, 'inputId', (e.target as HTMLInputElement).value)}/>
                                    </label>
                                    <button onClick={() => removeFormulaVariable(index)}
                                            style={{fontSize: '0.8em', padding: '2px 5px'}}>Удалить переменную
                                    </button>
                                </div>
                            ))}
                            <button onClick={addFormulaVariable}
                                    style={{fontSize: '0.9em', padding: '3px 6px'}}>Добавить переменную
                            </button>
                            <hr/>
                            <label>Domain Min: <input type="number"
                                                      value={(selectedItem as LinearGraphElement).domain.min}
                                                      onInput={(e) => onUpdateElement(selectedItem.id!, {
                                                          domain: {
                                                              ...(selectedItem as LinearGraphElement).domain,
                                                              min: parseFloat((e.target as HTMLInputElement).value)
                                                          }
                                                      })}/></label>
                            <label>Domain Max: <input type="number"
                                                      value={(selectedItem as LinearGraphElement).domain.max}
                                                      onInput={(e) => onUpdateElement(selectedItem.id!, {
                                                          domain: {
                                                              ...(selectedItem as LinearGraphElement).domain,
                                                              max: parseFloat((e.target as HTMLInputElement).value)
                                                          }
                                                      })}/></label>
                        </>
                    )}

                    <Layout h={42}/>

                    {onDeleteElement &&
                        <VStack
                            pos="sticky"
                            bottom={12}
                        >
                            <Button
                                onClick={onDeleteElement}
                                bg={ThemeTokens.error}
                                c={ThemeTokens.onError}
                            >
                                Удалить элемент
                            </Button>
                        </VStack>
                    }
                </>
            )}
            <style>{`
        .property-inspector label { display: block; margin-bottom: 8px; }
        .property-inspector input[type="text"], .property-inspector input[type="number"], .property-inspector textarea { width: calc(100% - 10px); margin-top: 2px; padding: 4px; }
        .property-inspector textarea { min-height: 60px; }
      `}</style>
        </VStack>
    );
};