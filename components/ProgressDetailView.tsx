import React, { useState } from 'react';
import { PracticeAttempt, Subject } from '../types';
import { Card } from './Card';
import { QuizResultDetails } from './QuizResultDetails';
import { SUBJECTS } from '../constants';

interface ProgressDetailViewProps {
    category: string | null;
    history: PracticeAttempt[];
    setActiveView: (view: string) => void;
    onRetryQuiz: (attempt: PracticeAttempt) => void;
}

const getSubjectsForCategory = (category: string | null): Subject[] => {
    if (!category) {
        return [];
    }
     switch (category) {
        case 'Toán': return ['Toán'];
        case 'Ngữ Văn': return ['Ngữ Văn', 'Tiếng Việt'];
        case 'Tiếng Anh': return ['Tiếng Anh'];
        case 'Khoa học tự nhiên': return ['Khoa học tự nhiên', 'Khoa học'];
        case 'Bài tập PDF': return ['Bài tập PDF'];
        case 'Bài tập Ảnh': return ['Bài tập Ảnh'];
        default: return [];
    }
};

export const ProgressDetailView: React.FC<ProgressDetailViewProps> = ({ category, history, setActiveView, onRetryQuiz }) => {
    const [selectedAttempt, setSelectedAttempt] = useState<PracticeAttempt | null>(null);

    const relevantSubjects = getSubjectsForCategory(category);
    const filteredHistory = history
        .filter(attempt => relevantSubjects.includes(attempt.subject))
        .sort((a, b) => b.timestamp - a.timestamp);

    const handleBackToList = () => {
        setSelectedAttempt(null);
    };

    if (selectedAttempt) {
        return (
            <div className="animate__animated animate__fadeIn space-y-4">
                 <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={handleBackToList}
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors"
                    >
                        &larr; Quay lại danh sách
                    </button>
                     <button
                        onClick={() => onRetryQuiz(selectedAttempt)}
                        className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-full hover:bg-cyan-600 transition-colors"
                    >
                        Làm lại bài này
                    </button>
                </div>
                <Card>
                    <h3 className="text-xl font-bold">
                        {selectedAttempt.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{new Date(selectedAttempt.timestamp).toLocaleString('vi-VN')}</p>
                    <QuizResultDetails
                        questions={selectedAttempt.questions}
                        answers={selectedAttempt.answers}
                        explanations={selectedAttempt.explanations}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="animate__animated animate__fadeIn space-y-6">
            <button
                onClick={() => setActiveView('dashboard')}
                className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors"
            >
                &larr; Quay lại Bảng điều khiển
            </button>
            <Card>
                <h2 className="text-2xl font-bold mb-4">Lịch sử luyện tập: {category}</h2>
                {filteredHistory.length > 0 ? (
                    <div className="space-y-4 mt-6">
                        {filteredHistory.map((attempt) => (
                            <div
                                key={attempt.timestamp}
                                className="p-4 border rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                onClick={() => setSelectedAttempt(attempt)}
                            >
                                <div>
                                    <p className="font-semibold">{attempt.title}</p>
                                    <p className="text-sm text-gray-500">{new Date(attempt.timestamp).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-lg text-cyan-600">{attempt.score}/{attempt.total}</p>
                                     <p className="text-sm text-gray-500">
                                        {Math.round((attempt.score / attempt.total) * 100)}%
                                     </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Bạn chưa có bài luyện tập nào trong mục này.</p>
                )}
            </Card>
        </div>
    );
};