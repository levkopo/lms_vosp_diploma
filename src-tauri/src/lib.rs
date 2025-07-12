mod models;
mod reader;

use std::collections::HashMap;
use std::ops::{Deref, DerefMut};

use crate::models::lessons::{Lesson, LessonContentType};
use crate::models::student::{Student, StudentModel};
use crate::models::tests::QuestionModel;

use crate::models::tests::Question;
use crate::reader::CourseReader;
use lazy_static::lazy_static;
use once_cell::sync::Lazy;

use rand::rng;
use rand::seq::index;
use std::sync::Mutex;
use crate::models::slides::Slide;

static COURSE: Lazy<Mutex<CourseReader>> = Lazy::new(|| {
    let course_file_path = std::path::Path::new("main.lkcourse");
    if !course_file_path.exists() {
        panic!("Курс не найден. Пожалуйста, сначала создайте его.");
    }

    Mutex::new(CourseReader::open(course_file_path).expect("Курс не удалось открыть"))
});

lazy_static! {
    static ref CURRENT_LESSON_ID: Mutex<Option<String>> = Mutex::new(None);
    static ref CURRENT_QUESTIONS: Mutex<Option<Vec<Question>>> = Mutex::new(None);
    static ref COMPLETED_LESSONS: Mutex<Vec<String>> = Mutex::new(vec![]);
    static ref STUDENT: Mutex<Option<Student>> = Mutex::new(None);
    static ref GRADES: Mutex<HashMap<String, u8>> = Mutex::new(HashMap::new());

    static ref FINAL_TEST_LESSON: Lesson = Lesson {
        id: String::from("final_test"),
        title: String::from("Итоговое тестирование"),
        description: String::from(""),
        lesson_type: LessonContentType::FinalTest,
        content_id: String::from(""),
    };
}

fn start_lesson(lesson_id: String) {
    let mut current_lesson_id = CURRENT_LESSON_ID.lock().unwrap();
    let mut current_questions_state = CURRENT_QUESTIONS.lock().unwrap();
    if current_lesson_id.is_some() {
        if current_lesson_id.get_or_insert(lesson_id.clone()) != &lesson_id {
            *current_lesson_id = None;
            *current_questions_state = None;
        }
    }else{
        *current_lesson_id = Some(lesson_id)
    }
}

#[tauri::command]
fn get_lessons() -> Vec<Lesson> {
    let mut binding = COURSE.lock().unwrap();
    let reader = binding.deref_mut();

    let mut lessons: Vec<Lesson> = reader
        .manifest
        .lessons
        .iter()
        .map(|lesson| lesson.clone())
        .collect();

    lessons.push(FINAL_TEST_LESSON.clone());
    lessons
}

#[tauri::command(rename_all = "snake_case")]
fn get_lesson_by_id(lesson_id: String) -> Result<Lesson, String> {
    match get_lessons().iter().find(|lesson| lesson.id == lesson_id) {
        None => Err(String::from("No lesson with that id")),
        Some(lesson) => Ok(lesson.clone()),
    }
}

#[tauri::command(rename_all = "snake_case")]
fn mark_lesson_as_completed(lesson_id: String) -> Result<bool, String> {
    match get_lessons().iter().find(|lesson| lesson.id == lesson_id) {
        None => Err(String::from("No lesson with that id")),
        Some(lesson) => {
            if lesson.lesson_type != LessonContentType::Slides {
                return Err(String::from("Access denies"))
            }

            // Добавление в список пройденных тестов
            let mut completed_lessons_state = COMPLETED_LESSONS.lock().unwrap();
            (*completed_lessons_state).push(lesson_id);

            Ok(true)
        },
    }
}

#[tauri::command(rename_all = "snake_case")]
fn get_slides(lesson_id: String) -> Result<Vec<Slide>, String> {
    start_lesson(lesson_id.clone());

    let mut binding = COURSE.lock().unwrap();
    let reader = binding.deref_mut();

    let lesson = reader
        .manifest
        .lessons
        .iter()
        .find(|lesson| lesson.id == lesson_id)
        .expect("Lesson not found");

    let slides_result = reader.get_lesson_slides(&lesson.clone());
    match slides_result {
        Ok(slides_option) => match slides_option {
            Some(slides) => Ok(slides),
            None => Err(String::from("Slides not found")),
        },
        Err(e) => Err(String::from(e.to_string())),
    }
}

#[tauri::command(rename_all = "snake_case")]
fn get_test_by_lesson_id(lesson_id: String) -> Result<Vec<QuestionModel>, String> {
    start_lesson(lesson_id.clone());

    let mut current_questions_state = CURRENT_QUESTIONS.lock().unwrap();
    let questions: Vec<Question> = match current_questions_state.deref() {
        Some(current_questions) => current_questions.clone(),
        None => {
            let mut binding = COURSE.lock().unwrap();
            let reader = binding.deref_mut();
            let tests: Vec<Lesson> = reader
                .manifest
                .lessons
                .iter()
                .filter(|it| it.lesson_type == LessonContentType::Test)
                .map(|it| it.clone())
                .collect();

            if FINAL_TEST_LESSON.id == lesson_id {
                let mut questions: Vec<Question> = vec![];

                let count_of_questions = tests.len() * 2;
                let count_of_questions_of_one_test = count_of_questions / tests.len();

                for lesson in tests {
                    let tests_result = reader.get_lesson_test(&lesson.clone());
                    match tests_result {
                        Ok(test_option) => match test_option {
                            Some(lesson_tests) => {
                                if lesson_tests.len() < count_of_questions_of_one_test {
                                    questions.extend(lesson_tests);
                                } else {
                                    let mut rng = rng();
                                    let indices = index::sample(&mut rng, lesson_tests.len(), count_of_questions_of_one_test);
                                    questions.extend(
                                        indices
                                            .into_iter()
                                            .map(|i| lesson_tests[i].clone())
                                    );
                                }
                            },
                            None => return Err(String::from("Test for course not found"))
                        }
                        Err(e) => return Err(e.to_string()),
                    }
                }

                questions
            }else{
                let lesson = tests
                    .iter()
                    .find(|lesson| lesson.id == lesson_id)
                    .expect("Lesson not found");

                let test_result = reader.get_lesson_test(&lesson.clone());
                match test_result {
                    Ok(test_option) => match test_option {
                        Some(test) => {
                            let mut rng = rng();
                            let indices = index::sample(&mut rng, test.len(), 5);

                            indices.into_iter().map(|i| test[i].clone()).collect()
                        }
                        None => return Err(String::from("Test for course not found"))
                    }
                    Err(e) => return Err(e.to_string()),
                }
            }
        }
    };

    *current_questions_state = Some(questions.clone());

    Ok(questions
        .iter()
        .map(|q| QuestionModel {
            question: q.question.clone(),
            answers: q.answers.clone(),
        })
        .collect::<Vec<QuestionModel>>())
}

fn calculate_grade(results: &Vec<bool>) -> u8 {
    if results.is_empty() {
        return 2;
    }

    let correct_answers = results.iter().filter(|&&res| res).count();
    let total_questions = results.len();

    let pre_grade_float = (correct_answers as f64 / total_questions as f64) * 5.0;
    let adjusted_pre_grade = if pre_grade_float < 2.0 {
        2.0
    } else {
        pre_grade_float
    };

    let final_grade_float = adjusted_pre_grade.round();

    let mut final_grade_u8 = final_grade_float as u8;
    if final_grade_u8 > 5 {
        final_grade_u8 = 5;
    }

    if final_grade_u8 < 2 {
        final_grade_u8 = 2;
    }

    final_grade_u8
}

#[tauri::command(rename_all = "snake_case")]
fn submit_answers(lesson_id: String, answers: Vec<u32>) -> Result<Vec<bool>, String> {
    let mut current_questions_state = CURRENT_QUESTIONS.lock().unwrap();
    match current_questions_state.deref() {
        None => Err(String::from("No questions found")),
        Some(questions) => {
            // Подсчет верных ответов
            let correct_answers = questions
                .iter()
                .enumerate()
                .map(|(index, question)| question.correct_answer_id == answers[index] || answers[index] == 532)
                .collect::<Vec<bool>>();

            // Сброс вопросов
            *current_questions_state = None;

            // Расчет оценки
            let grade = calculate_grade(&correct_answers);
            // Добавление оценки в список оценок
            let mut grades_state = GRADES.lock().unwrap();

            let mut grades = grades_state.deref().clone();
            grades.insert(lesson_id.clone(), grade);
            *grades_state = grades.clone();

            // Добавление в список пройденных уроков, только если оценка не 2
            if grade > 2 {
                let mut completed_lessons_state = COMPLETED_LESSONS.lock().unwrap();
                (*completed_lessons_state).push(lesson_id);
            }

            Ok(correct_answers.clone())
        }
    }
}

fn calculate_average(map: &HashMap<String, u8>) -> Option<f64> {
    if map.is_empty() {
        return None; //
    }

    let mut sum: u64 = 0;
    let count = map.len();

    for &value in map.values() {
        sum += value as u64;
    }

    Some(sum as f64 / count as f64)
}

#[tauri::command(rename_all = "snake_case")]
fn get_student() -> Result<StudentModel, String> {
    let student_state = STUDENT.lock().unwrap();
    match student_state.deref() {
        None => Err(String::from("Not authorized")),
        Some(student) => {
            let grades = GRADES.lock().unwrap();
            let completed_lessons_state = COMPLETED_LESSONS.lock().unwrap();

            Ok(StudentModel {
                first_name: student.first_name.clone(),
                last_name: student.last_name.clone(),
                group: student.group.clone(),
                preliminary_assessment: calculate_average(grades.deref())
                    .map(|avg_f64| avg_f64.round() as u8),
                completed_lessons: completed_lessons_state.clone(),
            })
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn login(first_name: String, last_name: String, group: String) -> Result<StudentModel, String> {
    let mut student_state = STUDENT.lock().unwrap();
    let student: Student = Student {
        first_name,
        last_name,
        group,
    };

    *student_state = Some(student.clone());

    Ok(StudentModel {
        first_name: student.first_name.clone(),
        last_name: student.last_name.clone(),
        group: student.group.clone(),
        preliminary_assessment: None,
        completed_lessons: vec![]
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            get_lessons,
            get_lesson_by_id,
            get_test_by_lesson_id,
            submit_answers,
            get_student,
            login,
            get_slides,
            mark_lesson_as_completed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
