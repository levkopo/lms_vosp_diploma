use std::fs::File;
use zip::ZipArchive;
use std::io::{BufReader, Read};
use std::path::Path;
use crate::models::manifest::CourseManifest;
use crate::models::slides::Slide;
use crate::models::tests::Question;
use crate::models::lessons::{
    Lesson, LessonContentType
};


pub struct CourseReader {
    archive: ZipArchive<BufReader<File>>, // Храним архив открытым
    pub manifest: CourseManifest,
}

impl CourseReader {
    pub fn open(file_path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let file = File::open(file_path)?;
        let reader = BufReader::new(file);
        let mut archive_tmp = ZipArchive::new(reader)?;

        let manifest: CourseManifest = {
            let mut manifest_file = archive_tmp.by_name("manifest.json")?;
            let mut manifest_json_content = String::new();
            manifest_file.read_to_string(&mut manifest_json_content)?;
            serde_json::from_str(&manifest_json_content)?
        };

        Ok(CourseReader { archive: archive_tmp, manifest })
    }

    // Получить слайды для конкретного урока
    pub fn get_lesson_slides(&mut self, lesson: &Lesson) -> Result<Option<Vec<Slide>>, Box<dyn std::error::Error>> {
        if !matches!(lesson.lesson_type, LessonContentType::Slides) {
            return Ok(None); // Это не урок со слайдами
        }
        let file_path = format!("lectures/{}", lesson.content_id);
        match self.archive.by_name(&file_path) {
            Ok(mut zipped_file) => {
                let mut json_content = String::new();
                zipped_file.read_to_string(&mut json_content)?;
                let slides: Vec<Slide> = serde_json::from_str(&json_content)?;
                Ok(Some(slides))
            }
            Err(zip::result::ZipError::FileNotFound) => Ok(None), // Файл не найден
            Err(e) => Err(Box::new(e)),
        }
    }

    // Получить тест для конкретного урока
    pub fn get_lesson_test(&mut self, lesson: &Lesson) -> Result<Option<Vec<Question>>, Box<dyn std::error::Error>> {
        if !matches!(lesson.lesson_type, LessonContentType::Test) {
            return Ok(None); // Это не урок с тестом
        }
        let file_path = format!("tests/{}", lesson.content_id);
        match self.archive.by_name(&file_path) {
            Ok(mut zipped_file) => {
                let mut json_content = String::new();
                zipped_file.read_to_string(&mut json_content)?;
                let questions: Vec<Question> = serde_json::from_str(&json_content)?;
                Ok(Some(questions))
            }
            Err(zip::result::ZipError::FileNotFound) => Ok(None),
            Err(e) => Err(Box::new(e)),
        }
    }

    // Получить изображение (возвращает Vec<u8> - байты изображения)
    pub fn get_image_data(&mut self, image_url_in_archive: &str) -> Result<Option<Vec<u8>>, Box<dyn std::error::Error>> {
        // image_url_in_archive должен быть путем как в ImageElement.url, например "images/my_image.png"
        match self.archive.by_name(image_url_in_archive) {
            Ok(mut zipped_file) => {
                let mut buffer = Vec::new();
                zipped_file.read_to_end(&mut buffer)?;
                Ok(Some(buffer))
            }
            Err(zip::result::ZipError::FileNotFound) => Ok(None),
            Err(e) => Err(Box::new(e)),
        }
    }
}