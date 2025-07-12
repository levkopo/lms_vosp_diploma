import {QuestionModel, TestModel} from "../models/TestModel.ts";
import {invoke} from "@tauri-apps/api/core";

export interface TestRepository {
    getTestByLessonId(lessonId: string): Promise<TestModel>;
    submitAnswers(lessonId: string, answers: number[]): Promise<boolean[]>;
}

class TestRepositoryImpl_ implements TestRepository {
    async getTestByLessonId(lessonId: string): Promise<TestModel> {
        return await invoke("get_test_by_lesson_id", {
            lesson_id: lessonId
        }).then(it => ({
            questions: it as QuestionModel[]
        }));
    }

    async submitAnswers(lessonId: string, answers: number[]): Promise<boolean[]> {
        return await invoke("submit_answers", {
            lesson_id: lessonId,
            answers: answers
        }) as boolean[]
    }
}

export const TestRepositoryImpl = new TestRepositoryImpl_()