#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Answer {
    pub id: u32,
    pub text: String,
}

#[derive(Debug, Clone, PartialEq, serde::Deserialize)]
pub struct Question {
    pub question: String,
    pub answers: Vec<Answer>,
    pub correct_answer_id: u32, // ID правильного ответа
}

#[derive(Debug, Clone, PartialEq, serde::Serialize)]
pub struct QuestionModel {
    pub question: String,
    pub answers: Vec<Answer>,
}

