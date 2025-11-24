import { Grade, Subject, PracticeQuestion, AnyMockExam } from '../types';
import { MOCK_EXAMS_SCIENCE } from './mockExamsScience';
import { MOCK_EXAMS_ENGLISH_GRADE_9_MIDTERM_1 } from './mockExamsEnglish';
import { MOCK_EXAMS_LITERATURE_GRADE_9_FINAL_1, MOCK_EXAMS_LITERATURE_GRADE_9_MIDTERM_1 } from './mockExamsLiterature';

// Moved from constants.ts and updated to ensure the final exam is open-ended
export const MOCK_EXAMS: { [key in Grade]?: { [key in Subject]?: { [key in 'midterm1' | 'final1' | 'midterm2' | 'final2']?: AnyMockExam[] } } } = {
    9: {
        "Ngữ Văn": {
            "midterm1": MOCK_EXAMS_LITERATURE_GRADE_9_MIDTERM_1,
            "final1": MOCK_EXAMS_LITERATURE_GRADE_9_FINAL_1
        },
        "Tiếng Anh": {
            "midterm1": MOCK_EXAMS_ENGLISH_GRADE_9_MIDTERM_1
        },
        "Khoa học tự nhiên": MOCK_EXAMS_SCIENCE
    }
};