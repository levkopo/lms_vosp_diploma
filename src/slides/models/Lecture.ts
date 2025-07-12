// --- Input Types ---
export type InputType = "text" | "number" | "slider";

export interface ElementPositioning {
    top?: string;    // e.g., "10px", "5%", "auto"
    left?: string;   // e.g., "20px", "10%", "auto"
    right?: string;  // e.g., "10px", "5%", "auto"
    bottom?: string; // e.g., "20px", "10%", "auto"
    width?: string;  // e.g., "300px", "50%", "auto"
    height?: string; // e.g., "auto", "200px", "auto"
    zIndex?: number; // For managing stacking order
}

export interface BaseInput {
    id: string; // Unique ID for this input, referenced by other elements
    label: string; // Display label for the input
    type: "input";
    inputType: InputType;
    defaultValue: string | number;
    positioning?: ElementPositioning;
}

export interface TextInput extends BaseInput {
    inputType: "text";
    defaultValue: string;
    placeholder?: string;
}

export interface NumberInput extends BaseInput {
    inputType: "number";
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number; // For finer control, also useful for sliders
}

export interface SliderInput extends BaseInput {
    inputType: "slider";
    defaultValue: number;
    min: number;
    max: number;
    step: number;
}

export type InputElement = TextInput | NumberInput | SliderInput;

export type GraphParameterValue = number | { inputId: string };

export interface FormulaGraphVariable {
    name: string;
    inputId: string;
    // defaultValue?: number; // Можно добавить, если inputId не найден (но лучше брать из defaultValue инпута)
}

export interface FormulaGraphParameters {
    formula: string;
    variables: FormulaGraphVariable[];
}

export interface LinearGraphElement {
    type: "linearGraph";
    id: string;
    formulaParameters?: FormulaGraphParameters;
    caption?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    domain?: { min: number; max: number };
    range?: { min: number; max: number };
    positioning?: ElementPositioning;
}

export interface TextElement {
    type: "text";
    id?: string;
    content: string;
    positioning?: ElementPositioning;
    fontSize?: string;
    fontWidth?: string;
}

export interface ImageElement {
    type: "image";
    id?: string;
    url: string;
    altText?: string;
    caption?: string;
    positioning?: ElementPositioning;
}

export interface TableElement {
    type: "table";
    id?: string;
    header: string[];
    rows: string[][];
    positioning?: ElementPositioning;
}

export type ContentElement =
    | TextElement
    | ImageElement
    | LinearGraphElement
    | InputElement
    | TableElement;

export interface Slide {
    id: string;
    elements: ContentElement[];
}

export interface Lecture {
    slides: Slide[];
}

export interface InputValues {
    [inputId: string]: string | number;
}

/**
 * Напиши информацию и какие изображения вставить в интерактивные слайды к урокам и тестам из файла по темам:
 * Затухание и окна прозрачности: Основные окна
 * Компоненты ВОСП: Основные понятия
 * Компоненты ВОСП: Усвоение информации (тест)
 * Пассивные компоненты: Общее описание и параметры
 * Оптические соединители: Классификация и стандарты
 * Оптические кабели: Виды и классификация
 * Оптические розетки: Виды и классификация
 * Пассивные компоненты: Усвоение информации (тест)
 * Активные компоненты: Общее описание и параметры
 * Формирователи оптического излучения: Виды, принцип работы
 * ПОМ и ПРОМ: Виды, принцип работы
 * Оптические усилители: Виды, принцип работы
 * Активные компоненты: Усвоение информации (тест)
 * Итоговое тестирование: (тест)
 */