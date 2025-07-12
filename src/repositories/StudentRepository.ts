import {LessonModel} from "../models/LessonModel.ts";
import {invoke} from "@tauri-apps/api/core";
import {StudentModel} from "../models/StudentModel.ts";

export interface StudentRepository {
    getCurrentStudent(): Promise<StudentModel | null>
    authorizeStudent(
        lastName: string,
        firstName: string,
        group: string,
    ): Promise<StudentModel | null>
}

class StudentRepositoryImpl_ implements StudentRepository {
    async getCurrentStudent(): Promise<StudentModel | null> {
        return await invoke("get_student") as StudentModel | null
    }

    async authorizeStudent(
        lastName: string,
        firstName: string,
        group: string,
    ): Promise<StudentModel> {
        return await invoke("login", {
            first_name: firstName,
            last_name: lastName,
            group: group,
        }) as StudentModel | undefined;
    }
}

export const StudentRepositoryImpl = new StudentRepositoryImpl_()