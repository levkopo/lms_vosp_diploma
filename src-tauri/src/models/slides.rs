use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ElementPositioning {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub left: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub right: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bottom: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<String>,
    #[serde(rename = "zIndex", skip_serializing_if = "Option::is_none")]
    pub z_index: Option<i32>, // i32 вместо number для большей точности
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "inputType")] // Поможет Serde различать варианты при десериализации
pub enum InputElement {
    #[serde(rename = "text")]
    Text {
        id: String,
        label: String,
        #[serde(rename = "defaultValue")]
        default_value: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        placeholder: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        positioning: Option<ElementPositioning>,
    },
    #[serde(rename = "number")]
    Number {
        id: String,
        label: String,
        #[serde(rename = "defaultValue")]
        default_value: f64, // Используем f64 для чисел с плавающей точкой
        #[serde(skip_serializing_if = "Option::is_none")]
        min: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        max: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        step: Option<f64>,
        #[serde(skip_serializing_if = "Option::is_none")]
        positioning: Option<ElementPositioning>,
    },
    #[serde(rename = "slider")]
    Slider {
        id: String,
        label: String,
        #[serde(rename = "defaultValue")]
        default_value: f64,
        min: f64,
        max: f64,
        step: f64,
        #[serde(skip_serializing_if = "Option::is_none")]
        positioning: Option<ElementPositioning>,
    },
}

// Общий тип для InputElement, чтобы скрыть детали enum, если нужно
// Это не обязательно, но может быть удобно для хранения в ContentElement
// #[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
// pub struct GenericInputElement {
//     // общие поля
//     pub id: String,
//     pub label: String,
//     #[serde(flatten)] // "Встраивает" поля из enum InputElement
//     pub specific_input: InputElement,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub positioning: Option<ElementPositioning>,
// }


#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FormulaGraphVariable {
    pub name: String,
    #[serde(rename = "inputId")]
    pub input_id: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FormulaGraphParameters {
    pub formula: String,
    pub variables: Vec<FormulaGraphVariable>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DomainRange {
    pub min: f64,
    pub max: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct LinearGraphElement {
    // type: "linearGraph" - будет обработан через ContentElement enum
    pub id: String,
    #[serde(rename = "formulaParameters", skip_serializing_if = "Option::is_none")]
    pub formula_parameters: Option<FormulaGraphParameters>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
    #[serde(rename = "xAxisLabel", skip_serializing_if = "Option::is_none")]
    pub x_axis_label: Option<String>,
    #[serde(rename = "yAxisLabel", skip_serializing_if = "Option::is_none")]
    pub y_axis_label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub domain: Option<DomainRange>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub range: Option<DomainRange>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub positioning: Option<ElementPositioning>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TextElement {
    // type: "text"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub positioning: Option<ElementPositioning>,
    #[serde(rename = "fontSize", skip_serializing_if = "Option::is_none")]
    pub font_size: Option<String>,
    #[serde(rename = "fontWidth", skip_serializing_if = "Option::is_none")]
    pub font_weight: Option<String>, // fontWidth -> fontWeight, более стандартно
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TableElement {
    // type: "table"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub header: Vec<String>,
    pub rows: Vec<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub positioning: Option<ElementPositioning>
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ImageElement {
    // type: "image"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub url: String, // Путь к изображению внутри архива, например "images/my_image.png"
    #[serde(rename = "altText", skip_serializing_if = "Option::is_none")]
    pub alt_text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub positioning: Option<ElementPositioning>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")] // Это поле будет определять, какой вариант enum используется
pub enum ContentElement {
    #[serde(rename = "text")]
    Text(TextElement),
    #[serde(rename = "image")]
    Image(ImageElement),
    #[serde(rename = "linearGraph")]
    LinearGraph(LinearGraphElement),
    #[serde(rename = "table")]
    Table(TableElement),
    #[serde(rename = "input")] // Общий тег для всех инпутов
    Input(InputElement), // InputElement уже имеет свой tag = "inputType"
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Slide {
    pub id: String, // Уникальный ID слайда в рамках урока
    pub elements: Vec<ContentElement>,
}