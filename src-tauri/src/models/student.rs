#[derive(Clone, serde::Serialize)]
pub struct StudentModel {
    pub first_name: String,
    pub last_name: String,
    pub group: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub preliminary_assessment: Option<u8>,

    pub completed_lessons: Vec<String>,
}

#[derive(Clone)]
pub struct Student {
    pub first_name: String,
    pub last_name: String,
    pub group: String,
}
