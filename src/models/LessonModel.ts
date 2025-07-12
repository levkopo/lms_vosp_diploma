export type LessonType = 'slides' | 'test' | 'final_test'
export type LessonModel = {
    id: string
    title: string
    description: string
    type: LessonType
    preview_image: string
    available?: boolean
}