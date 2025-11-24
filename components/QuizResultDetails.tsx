import React from 'react';
import { PracticeQuestion } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CheckSquareIcon, XIcon } from './Icons';

interface QuizResultDetailsProps {
    questions: PracticeQuestion[];
    answers: { [key: number]: string };
    explanations: { [key: number]: string };
}

export const QuizResultDetails: React.FC<QuizResultDetailsProps> = ({ questions, answers, explanations }) => {
    return (
        <div className="space-y-6">
            {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'bg-green-50/50 border-green-500' : 'bg-red-50/50 border-red-500'}`}>
                        <div className="font-bold text-gray-800 flex items-start">
                           <span className="mr-2">{i + 1}.</span>
                           <div className="flex-1">
                             <MarkdownRenderer content={q.question} />
                           </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            {q.options.map((option, optionIndex) => {
                                const isUserAnswer = userAnswer === option;
                                const isCorrectAnswer = q.correctAnswer === option;
                                
                                let optionClasses = "p-3 border rounded-lg text-left text-sm flex items-center gap-3 transition-colors";
                                let icon;

                                if (isCorrectAnswer) {
                                    optionClasses += " bg-green-100 border-green-400 font-semibold text-green-800";
                                    icon = <CheckSquareIcon className="w-5 h-5 text-green-600 flex-shrink-0" />;
                                } else if (isUserAnswer && !isCorrectAnswer) {
                                    optionClasses += " bg-red-100 border-red-400 text-red-800";
                                    icon = <XIcon className="w-5 h-5 text-red-600 flex-shrink-0" />;
                                } else {
                                    optionClasses += " bg-white border-gray-300 text-gray-700";
                                    // Use a placeholder to keep alignment
                                    icon = <div className="w-5 h-5 flex-shrink-0"></div>;
                                }

                                return (
                                    <div key={optionIndex} className={optionClasses}>
                                        {icon}
                                        <div className={`flex-1 ${isUserAnswer && !isCorrectAnswer ? 'line-through' : ''}`}>
                                            <MarkdownRenderer content={option} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {!isCorrect && explanations[i] && (
                            <div className="mt-4 pt-3 border-t border-dashed border-red-300">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Giải thích:</p>
                                <div className="text-sm text-gray-600">
                                    <MarkdownRenderer content={explanations[i]} />
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
};
