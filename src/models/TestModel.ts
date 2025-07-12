export type AnswerModel = {
    id: number;
    text: string;
}

export type QuestionModel = {
    question: string;
    answers: AnswerModel[]
}

export type TestModel = {
    questions: QuestionModel[]
}