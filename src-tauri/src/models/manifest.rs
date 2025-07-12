use crate::models::lessons::Lesson;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CourseManifest {
    pub title: String,
    pub version: String,
    pub lessons: Vec<Lesson>,
}
