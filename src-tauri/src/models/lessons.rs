#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LessonContentType {
    Slides,
    Test,
    FinalTest,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Lesson {
    pub id: String,
    pub title: String,
    pub description: String,
    #[serde(rename = "type")]
    pub lesson_type: LessonContentType,
    pub content_id: String,
}