import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { PracticeAttempt, WeeklyPlan, StudyPlanSession, Subject, PlanPracticeRequest, AITutorMessage } from '../types';
import { generateWeeklyStudyPlan, updateWeeklyStudyPlan } from '../services/geminiService';
import { MoonIcon, SparklesIcon, SunIcon, CalendarDaysIcon, EditIcon, XIcon, SendIcon } from './Icons';
import { SUBJECTS } from '../constants';
import { TeacherCharacter } from './TeacherCharacter';

interface StudyPlanViewProps {
    practiceHistory: PracticeAttempt[];
    weeklyPlan: WeeklyPlan | null;
    setWeeklyPlan: React.Dispatch<React.SetStateAction<WeeklyPlan | null>>;
    onPracticeFromPlan: (request: PlanPracticeRequest) => void;
}

interface EditingSessionInfo {
    dayIndex: number;
    period: 'morning' | 'evening';
    session: StudyPlanSession;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ practiceHistory, weeklyPlan, setWeeklyPlan, onPracticeFromPlan }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingSessionInfo, setEditingSessionInfo] = useState<EditingSessionInfo | null>(null);
    const [chatMessages, setChatMessages] = useState<AITutorMessage[]>([
        { role: 'model', text: 'Chào bạn! Bạn muốn điều chỉnh kế hoạch học tập của mình như thế nào?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        setWeeklyPlan(null);
        
        const weakTopics = new Set<string>();
        practiceHistory.forEach(attempt => {
            attempt.questions.forEach((q, index) => {
                if (attempt.answers[index] !== q.correctAnswer) {
                    weakTopics.add(q.topic);
                }
            });
        });
        
        const plan = await generateWeeklyStudyPlan(Array.from(weakTopics));
        
        if (plan) {
            setWeeklyPlan(plan);
        } else {
            alert("Rất tiếc, đã có lỗi xảy ra khi tạo lộ trình học tập. Vui lòng thử lại.");
        }
        
        setIsGenerating(false);
    };

    const handleEditSession = (dayIndex: number, period: 'morning' | 'evening') => {
        const sessionToEdit = weeklyPlan?.[dayIndex]?.[period];
        if (sessionToEdit) {
            setEditingSessionInfo({ dayIndex, period, session: sessionToEdit });
        }
    };
    
    const handleSaveSession = (updatedSession: StudyPlanSession) => {
        if (!editingSessionInfo || !weeklyPlan) return;

        const { dayIndex, period } = editingSessionInfo;
        const newPlan = [...weeklyPlan];
        const dayToUpdate = { ...newPlan[dayIndex] };
        dayToUpdate[period] = updatedSession;
        newPlan[dayIndex] = dayToUpdate;
        
        setWeeklyPlan(newPlan);
        setEditingSessionInfo(null);
    };

    const handleCreatePracticeFromPlan = (session: StudyPlanSession) => {
        const subject = SUBJECTS.find(s => s === session.subject);
        if (subject) {
            onPracticeFromPlan({
                subject: subject,
                topic: session.topic,
                numMcq: 10,
                numOpenEnded: 2,
            });
        } else {
            alert(`Không thể tạo bài tập cho môn: ${session.subject}`);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading || !weeklyPlan) return;

        const userMessage: AITutorMessage = { role: 'user', text: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsChatLoading(true);

        const result = await updateWeeklyStudyPlan(weeklyPlan, chatInput);

        if (result) {
            setWeeklyPlan(result.updatedPlan);
            const modelMessage: AITutorMessage = { role: 'model', text: result.responseText };
            setChatMessages(prev => [...prev, modelMessage]);
        } else {
            const errorMessage: AITutorMessage = { role: 'model', text: 'Rất tiếc, mình đã gặp lỗi khi cập nhật kế hoạch. Vui lòng thử lại.' };
            setChatMessages(prev => [...prev, errorMessage]);
        }
        setIsChatLoading(false);
    };

    const EditSessionModal: React.FC = () => {
        const [sessionData, setSessionData] = useState<StudyPlanSession>(editingSessionInfo!.session);

        const handleInputChange = (field: keyof StudyPlanSession, value: string) => {
            setSessionData(prev => ({ ...prev, [field]: value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleSaveSession(sessionData);
        };

        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate__animated animate__fadeIn animate__faster">
                <Card className="w-full max-w-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Chỉnh sửa buổi học</h3>
                        <button onClick={() => setEditingSessionInfo(null)} className="p-1 rounded-full hover:bg-gray-100">
                            <XIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Môn học</label>
                            <select 
                                value={sessionData.subject} 
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Chủ đề</label>
                            <input 
                                type="text"
                                value={sessionData.topic} 
                                onChange={(e) => handleInputChange('topic', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hoạt động</label>
                            <input 
                                type="text"
                                value={sessionData.activity} 
                                onChange={(e) => handleInputChange('activity', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                             <button type="button" onClick={() => setEditingSessionInfo(null)} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Hủy</button>
                             <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700">Lưu thay đổi</button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    };

    if (!weeklyPlan && !isGenerating) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="text-center max-w-lg">
                    <CalendarDaysIcon className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Lộ Trình Học Tập Cá Nhân</h2>
                    <p className="text-gray-600 my-4">Hãy để Gia sư AI phân tích kết quả học tập của bạn và tạo ra một kế hoạch ôn tập hàng tuần được tối ưu hóa, giúp bạn tập trung vào những kiến thức quan trọng nhất.</p>
                    <button onClick={handleGeneratePlan} className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-transform hover:scale-105 flex items-center justify-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        Tạo lộ trình cho tôi
                    </button>
                </Card>
            </div>
        );
    }
    
    if (isGenerating) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="text-center max-w-lg">
                    <SparklesIcon className="w-16 h-16 mx-auto text-purple-500 animate-pulse mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Đang xây dựng kế hoạch...</h2>
                    <p className="text-gray-600 my-4">Gia sư AI đang phân tích và chuẩn bị một lộ trình hoàn hảo cho bạn. Vui lòng chờ trong giây lát!</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Lộ trình học tập tuần này</h2>
                 <button onClick={() => { setWeeklyPlan(null); }} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                    Tạo lại lộ trình
                </button>
            </div>
            <div className="space-y-8">
                {weeklyPlan?.map((day, dayIndex) => (
                    <Card key={day.dayOfWeek}>
                        <h3 className="text-xl font-bold text-cyan-700 mb-4">{day.dayOfWeek}</h3>
                        <div className="space-y-4">
                            {day.morning ? (
                                 <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg relative group">
                                    <SunIcon className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Sáng: {day.morning.subject} - {day.morning.topic}</p>
                                        <p className="text-sm text-gray-600">{day.morning.activity}</p>
                                        {day.morning.activity.toLowerCase().includes('bài tập') && (
                                            <button onClick={() => handleCreatePracticeFromPlan(day.morning!)} className="text-xs bg-cyan-100 text-cyan-700 font-semibold px-3 py-1 rounded-full mt-2 hover:bg-cyan-200 transition-colors">
                                                Bắt đầu luyện tập
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => handleEditSession(dayIndex, 'morning')} className="absolute top-2 right-2 p-2 rounded-full bg-white/50 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-cyan-600 transition-all">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : <div className="p-4 text-gray-400 italic">Buổi sáng nghỉ ngơi.</div>}
                             {day.evening ? (
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg relative group">
                                    <MoonIcon className="w-7 h-7 text-indigo-500 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Tối: {day.evening.subject} - {day.evening.topic}</p>
                                        <p className="text-sm text-gray-600">{day.evening.activity}</p>
                                         {day.evening.activity.toLowerCase().includes('bài tập') && (
                                            <button onClick={() => handleCreatePracticeFromPlan(day.evening!)} className="text-xs bg-cyan-100 text-cyan-700 font-semibold px-3 py-1 rounded-full mt-2 hover:bg-cyan-200 transition-colors">
                                                Bắt đầu luyện tập
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => handleEditSession(dayIndex, 'evening')} className="absolute top-2 right-2 p-2 rounded-full bg-white/50 text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-cyan-600 transition-all">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : <div className="p-4 text-gray-400 italic">Buổi tối nghỉ ngơi.</div>}
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-purple-500" />
                    Tùy chỉnh lộ trình với AI
                </h3>
                <div className="h-96 flex flex-col bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 animate__animated animate__fadeInUp animate__faster ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <TeacherCharacter className="w-12 h-16 flex-shrink-0" />}
                            <div className={`max-w-md lg:max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-md'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            </div>
                        ))}
                         {isChatLoading && (
                            <div className="flex items-end gap-3 animate__animated animate__fadeInUp animate__faster">
                                <TeacherCharacter className="w-12 h-16 flex-shrink-0" isAnimating={true} />
                                <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-md">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Gia sư đang suy nghĩ</span>
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                     <form onSubmit={handleSendMessage} className="mt-4">
                        <div className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={!weeklyPlan ? "Tạo lộ trình trước khi trò chuyện" : "ví dụ: Thêm buổi ôn Văn vào tối thứ Sáu..."}
                            className="w-full pl-4 pr-12 py-3 rounded-full border-2 border-transparent bg-white focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition duration-300 shadow-sm"
                            disabled={isChatLoading || !weeklyPlan}
                        />
                        <button
                            type="submit"
                            disabled={isChatLoading || !chatInput.trim() || !weeklyPlan}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-300 transition-colors duration-300"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                        </div>
                    </form>
                </div>
            </Card>

            {editingSessionInfo && <EditSessionModal />}
        </div>
    )
}