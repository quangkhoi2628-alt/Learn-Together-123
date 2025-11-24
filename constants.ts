
import { Grade, Subject, BookSeries } from './types';

export const SUBJECTS: Subject[] = ["Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên"];
export const GRADES: Grade[] = [9];

export const getSubjectsByGrade = (grade: Grade): Subject[] => {
    if (grade === 9) {
        return ["Ngữ Văn", "Toán", "Tiếng Anh", "Khoa học tự nhiên"];
    }
    return [];
};

export const BOOK_SERIES: readonly BookSeries[] = ["Chân trời sáng tạo", "Kết nối tri thức", "Cánh diều", "Family and Friends"];