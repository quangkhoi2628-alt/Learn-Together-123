import React, { useState, useRef } from 'react';
import { User, CommunityQuestion, CommunityAnswer, CommunityAttachment, Subject } from '../types';
import { Card } from './Card';
import { MessageSquareIcon, ThumbsUpIcon, SendIcon, PaperclipIcon, CameraIcon, SparklesIcon } from './Icons';
import { SUBJECTS } from '../constants';

// Helper to format time since post
const timeSince = (date: number) => {
  const seconds = Math.floor((new Date().getTime() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vài giây trước";
};

// Helper to read file as Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

interface CommunityViewProps {
  user: User;
  communityData: { questions: CommunityQuestion[] };
  setCommunityData: React.Dispatch<React.SetStateAction<{ questions: CommunityQuestion[] }>>;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ user, communityData, setCommunityData }) => {
    const [selectedQuestion, setSelectedQuestion] = useState<CommunityQuestion | null>(null);
    const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState<Subject | 'all'>('all');

    const handleCreateQuestion = (newQuestion: Omit<CommunityQuestion, 'id' | 'authorId' | 'authorDisplayName' | 'timestamp' | 'likes' | 'answers'>) => {
        const questionToAdd: CommunityQuestion = {
            id: `q${Date.now()}`,
            authorId: user.email,
            authorDisplayName: newQuestion.isAnonymous ? 'Người dùng ẩn danh' : (user.communityDisplayName || user.name),
            timestamp: Date.now(),
            likes: [],
            answers: [],
            ...newQuestion,
        };
        setCommunityData(prev => ({ questions: [questionToAdd, ...prev.questions] }));
        setShowNewQuestionModal(false);
        setSelectedQuestion(questionToAdd);
    };

    const handleCreateAnswer = (questionId: string, content: string) => {
        if (!content.trim()) return;

        const newAnswer: CommunityAnswer = {
            id: `a${Date.now()}`,
            questionId,
            authorId: user.email,
            authorDisplayName: user.communityDisplayName || user.name,
            content,
            timestamp: Date.now(),
            likes: [],
        };

        const updatedQuestions = communityData.questions.map(q => 
            q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
        );
        
        setCommunityData({ questions: updatedQuestions });

        if (selectedQuestion && selectedQuestion.id === questionId) {
            setSelectedQuestion(prev => prev ? { ...prev, answers: [...prev.answers, newAnswer] } : null);
        }
    };
    
    const handleLike = (questionId: string, answerId?: string) => {
        const userId = user.email;
        
        const updatedQuestions = communityData.questions.map(q => {
            if (q.id !== questionId) return q;

            if (!answerId) { // Like a question
                const newLikes = q.likes.includes(userId) ? q.likes.filter(id => id !== userId) : [...q.likes, userId];
                return { ...q, likes: newLikes };
            }

            // Like an answer
            const newAnswers = q.answers.map(a => {
                if (a.id !== answerId) return a;
                const newLikes = a.likes.includes(userId) ? a.likes.filter(id => id !== userId) : [...a.likes, userId];
                return { ...a, likes: newLikes };
            });
            return { ...q, answers: newAnswers };
        });

        setCommunityData({ questions: updatedQuestions });

        if (selectedQuestion && selectedQuestion.id === questionId) {
            setSelectedQuestion(updatedQuestions.find(q => q.id === questionId) || null);
        }
    };

    const renderContent = () => {
        if (selectedQuestion) {
            return <QuestionDetailView 
                        question={selectedQuestion} 
                        user={user} 
                        onBack={() => setSelectedQuestion(null)}
                        onCreateAnswer={handleCreateAnswer}
                        onLike={handleLike}
                    />;
        }

        const filteredQuestions = subjectFilter === 'all' ? communityData.questions : communityData.questions.filter(q => q.subject === subjectFilter);
        return (
            <div>
                 <div className="mb-4 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                         <button onClick={() => setSubjectFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${subjectFilter === 'all' ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Tất cả</button>
                        {SUBJECTS.map(s => (
                            <button key={s} onClick={() => setSubjectFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${subjectFilter === s ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{s}</button>
                        ))}
                    </div>
                </div>
                <ForumView questions={filteredQuestions} onSelectQuestion={setSelectedQuestion} />
            </div>
        );
    };

    return (
        <div className="animate__animated animate__fadeIn">
             <div className="flex justify-end mb-4">
                <button onClick={() => setShowNewQuestionModal(true)} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors text-sm flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" /> Đặt câu hỏi mới
                </button>
             </div>
           
            <div>
                {renderContent()}
            </div>
            {showNewQuestionModal && <NewQuestionModal onClose={() => setShowNewQuestionModal(false)} onCreate={handleCreateQuestion} />}
        </div>
    );
};

const ForumView: React.FC<{ questions: CommunityQuestion[], onSelectQuestion: (q: CommunityQuestion) => void }> = ({ questions, onSelectQuestion }) => (
    <Card>
        <div className="space-y-4">
            {questions.length > 0 ? questions.map(q => (
                <div key={q.id} onClick={() => onSelectQuestion(q)} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                         <h3 className="font-bold text-lg text-cyan-700 pr-4">{q.title}</h3>
                         <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full whitespace-nowrap">{q.subject}</span>
                    </div>
                   
                    <p className="text-sm text-gray-500 mt-1">
                        bởi <span className="font-semibold">{q.authorDisplayName}</span> - {timeSince(q.timestamp)}
                    </p>
                    <p className="mt-2 text-gray-700 truncate">{q.content}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><ThumbsUpIcon className="w-4 h-4" /> {q.likes.length} lượt thích</span>
                        <span className="flex items-center gap-1"><MessageSquareIcon className="w-4 h-4" /> {q.answers.length} trả lời</span>
                    </div>
                </div>
            )) : <p className="text-gray-500 text-center py-8">Chưa có câu hỏi nào khớp với bộ lọc.</p>}
        </div>
    </Card>
);

const QuestionDetailView: React.FC<{ question: CommunityQuestion, user: User, onBack: () => void, onCreateAnswer: (questionId: string, content: string) => void, onLike: (questionId: string, answerId?: string) => void }> = ({ question, user, onBack, onCreateAnswer, onLike }) => {
    const [answerContent, setAnswerContent] = useState('');
    const hasLikedQuestion = question.likes.includes(user.email);

    const handleSubmitAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateAnswer(question.id, answerContent);
        setAnswerContent('');
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300">&larr; Quay lại diễn đàn</button>
            <Card>
                 <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
                     <span className="text-sm font-semibold bg-cyan-100 text-cyan-800 px-3 py-1.5 rounded-full whitespace-nowrap">{question.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>bởi</span>
                    <span className="font-semibold">{question.authorDisplayName}</span>
                    <span>- {timeSince(question.timestamp)}</span>
                </div>
                <div className="prose max-w-none mb-4">{question.content}</div>
                
                {question.attachments.map((att, index) => (
                    <div key={index} className="mb-4">
                        {att.type === 'image' && att.dataUrl && <img src={att.dataUrl} alt={att.name} className="max-w-sm rounded-lg border" />}
                        {att.type === 'file' && <div className="p-2 border rounded-lg bg-gray-100 flex items-center gap-2"><PaperclipIcon className="w-4 h-4" /> {att.name}</div>}
                    </div>
                ))}

                <button onClick={() => onLike(question.id)} className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${hasLikedQuestion ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <ThumbsUpIcon className="w-5 h-5" /> Thích ({question.likes.length})
                </button>
            </Card>

            <Card>
                <h3 className="text-xl font-bold mb-4">{question.answers.length} Trả lời</h3>
                <div className="space-y-4">
                    {question.answers.map(answer => {
                        const hasLikedAnswer = answer.likes.includes(user.email);
                        return (
                            <div key={answer.id} className="p-4 border-t">
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">{answer.authorDisplayName}</span> - {timeSince(answer.timestamp)}
                                </p>
                                <div className="prose max-w-none mt-2">{answer.content}</div>
                                <button onClick={() => onLike(question.id, answer.id)} className={`mt-2 flex items-center gap-1 text-sm p-1 rounded transition-colors ${hasLikedAnswer ? 'text-cyan-600' : 'text-gray-500 hover:text-gray-800'}`}>
                                    <ThumbsUpIcon className="w-4 h-4" /> ({answer.likes.length})
                                </button>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-bold mb-4">Gửi câu trả lời của bạn</h3>
                    <form onSubmit={handleSubmitAnswer}>
                        <textarea value={answerContent} onChange={e => setAnswerContent(e.target.value)} placeholder="Viết câu trả lời của bạn..." className="w-full h-24 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-300" required />
                        <button type="submit" className="mt-2 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                            <SendIcon className="w-4 h-4"/> Gửi trả lời
                        </button>
                    </form>
            </Card>
        </div>
    );
};

const NewQuestionModal: React.FC<{ onClose: () => void, onCreate: (q: any) => void }> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState<Subject>('Toán');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [attachments, setAttachments] = useState<CommunityAttachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newAttachment: CommunityAttachment = { name: file.name, type: file.type.startsWith('image/') ? 'image' : 'file' };
            if (newAttachment.type === 'image') {
                newAttachment.dataUrl = await fileToBase64(file);
            }
            setAttachments(prev => [...prev, newAttachment]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            onCreate({ title, content, subject, isAnonymous, attachments });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl animate__animated animate__fadeInUp animate__faster">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Đặt câu hỏi mới</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề câu hỏi..." className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-300" required />
                    <div>
                        <label htmlFor="subject-select" className="text-sm font-medium text-gray-700">Chọn môn học</label>
                        <select id="subject-select" value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full mt-1 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-300">
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung chi tiết..." className="w-full h-32 p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-300" required />
                    
                    <div>
                        {attachments.map((att, i) => (
                             <div key={i} className="p-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                                {att.type === 'image' ? <CameraIcon className="w-4 h-4"/> : <PaperclipIcon className="w-4 h-4" />}
                                {att.name}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                           <PaperclipIcon className="w-5 h-5" /> Đính kèm
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded"/>
                            <span>Đăng ẩn danh</span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 font-bold py-2 px-4 rounded-lg">Hủy</button>
                        <button type="submit" className="flex-1 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg">Đăng câu hỏi</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
