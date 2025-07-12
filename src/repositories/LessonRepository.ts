import {LessonModel} from "../models/LessonModel.ts";
import {invoke} from "@tauri-apps/api/core";
import {Slide} from "../slides/models";

export interface LessonRepository {
    getLessons(): Promise<LessonModel[]>
    getLessonById(lessonId: string): Promise<LessonModel | undefined>
    getSlides(lessonId: string): Promise<Slide[] | undefined>
    markLessonAsCompleted(lessonId: string): Promise<boolean | null>
}

class LessonRepositoryImpl_ implements LessonRepository {
    async getLessonById(lessonId: string): Promise<LessonModel | undefined> {
        return await invoke("get_lesson_by_id", {
            lesson_id: lessonId,
        }) as LessonModel | undefined;
    }

    async getLessons(): Promise<LessonModel[]> {
        return await invoke("get_lessons") as LessonModel[];
    }

    async getSlides(lessonId: string): Promise<Slide[] | null> {
        return await invoke("get_slides", {
            lesson_id: lessonId,
        }) as Slide[] | null
    }

    async markLessonAsCompleted(lessonId: string): Promise<boolean | null> {
        return await invoke("mark_lesson_as_completed", {
            lesson_id: lessonId,
        }) as boolean | null
    }
}

export const LessonRepositoryImpl = new LessonRepositoryImpl_()