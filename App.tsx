import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Grade, Subject, NavItem, Flashcard, PracticeQuestion, User, AITutorMessage, PracticeAttempt, SolutionHistoryItem, AIToolHistoryItem, AITutorSession, PlanPracticeRequest, WeeklyPlan } from './types';
import { SUBJECTS, GRADES, getSubjectsByGrade } from './constants';
import { generateFlashcards, generateSummary, extractTextFromFile } from './services/geminiService';
import { AITutor } from './components/AITutor';
import { Card } from './components/Card';
import { TeacherCharacter } from './components/TeacherCharacter';
import { HomeIcon, BookOpenIcon, CheckSquareIcon, SparklesIcon, LightbulbIcon, ClipboardIcon, CalculatorIcon, GlobeIcon, BeakerIcon, AtomIcon, LeafIcon, LockIcon, LogOutIcon, FileTextIcon, MenuIcon, XIcon, CameraIcon, UploadCloudIcon, LandmarkIcon, ScaleIcon, CalendarDaysIcon } from './components/Icons';
import { HomeworkView } from './components/HomeworkView';
import { PracticeView } from './components/PracticeView';
import { ProgressDetailView } from './components/ProgressDetailView';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { StudyPlanView } from './components/StudyPlanView';

const NAV_ITEMS: NavItem[] = [
  { name: 'Bảng điều khiển', icon: <HomeIcon />, view: 'dashboard' },
  { name: 'Giải Bài Tập', icon: <BookOpenIcon />, view: 'homework' },
  { name: 'Luyện Tập & Thi Cử', icon: <CheckSquareIcon />, view: 'practice' },
  { name: 'Lộ trình học tập', icon: <CalendarDaysIcon />, view: 'studyPlan' },
  { name: 'Công Cụ AI', icon: <SparklesIcon />, view: 'tools' },
];

const INITIAL_TUTOR_MESSAGE: AITutorMessage[] = [
    { role: 'model', text: "Xin chào! Mình là Gia sư AI. Hãy hỏi mình bất kỳ câu hỏi bài tập nào, mình sẽ giúp bạn giải quyết từng bước một!" }
];

// Mock user for a login-free experience
const currentUser: User = { 
    name: 'Học sinh Lớp 9', 
    email: 'student.grade9@learntogether.com', 
    school: 'Trường THCS Tương Lai', 
    grade: 9, 
};


type ActivityHistoryItem = PracticeAttempt | SolutionHistoryItem | AIToolHistoryItem;

const Sidebar: React.FC<{ 
    activeView: string; 
    setActiveView: (view: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    
    const handleItemClick = (view: string) => {
        setActiveView(view);
        setIsOpen(false);
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setIsOpen(false)}
            />
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white p-6 flex flex-col shadow-lg z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500 p-2 rounded-lg">
                            <LightbulbIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">LearnTogether</h1>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-500 hover:text-gray-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex flex-col space-y-2">
                {NAV_ITEMS.map((item) => (
                    <a
                    key={item.name}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleItemClick(item.view); }}
                    className={`flex items-center gap-4 p-3 rounded-lg text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors duration-200 ${activeView === item.view ? 'bg-cyan-100 text-cyan-700 font-semibold' : ''}`}
                    >
                    {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                    <span>{item.name}</span>
                    </a>
                ))}
                </nav>
                <div className="mt-auto">
                    <Card className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white text-center">
                        <SparklesIcon className="w-10 h-10 mx-auto mb-2 opacity-80" />
                        <h3 className="font-bold mb-1">Gia Sư AI</h3>
                        <p className="text-sm opacity-90 mb-4">Gặp khó khăn? Nhận trợ giúp ngay!</p>
                        <button onClick={() => handleItemClick('tutor')} className="w-full bg-white text-purple-600 font-semibold py-2 rounded-lg hover:bg-purple-50 transition-colors">
                            Hỏi Ngay
                        </button>
                    </Card>
                </div>
            </aside>
        </>
    );
};

const Header: React.FC<{ 
    activeView: string; 
    onMenuClick: () => void;
}> = ({ activeView, onMenuClick }) => (
    <header className="flex justify-between items-center p-6 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
             <button 
              onClick={onMenuClick} 
              className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
              <span className="font-semibold hidden sm:inline">Menu</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 capitalize hidden md:block">{NAV_ITEMS.find(item => item.view === activeView)?.name || activeView}</h2>
        </div>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center font-bold text-yellow-800">
                {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{currentUser.name}</span>
        </div>
    </header>
);

const Dashboard: React.FC<{
  setActiveView: (view: string) => void;
  practiceHistory: PracticeAttempt[];
  solutionHistory: SolutionHistoryItem[];
  aiToolHistory: AIToolHistoryItem[];
  onSelectProgressCategory: (category: string) => void;
}> = ({ setActiveView, practiceHistory, solutionHistory, aiToolHistory, onSelectProgressCategory }) => {
    
    const allHistory: ActivityHistoryItem[] = React.useMemo(() => {
        return [
            ...practiceHistory,
            ...solutionHistory,
            ...aiToolHistory,
        ].sort((a, b) => b.timestamp - a.timestamp);
    }, [practiceHistory, solutionHistory, aiToolHistory]);

    const recentActivities = allHistory.slice(0, 5);

    const renderActivityItem = (item: ActivityHistoryItem) => {
        let icon: React.ReactElement;
        let description: React.ReactNode;

        if ('questions' in item) { // PracticeAttempt
            icon = <CheckSquareIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
            description = <>Hoàn thành bài luyện tập: <span className="font-semibold">{item.subject}</span></>;
        } else if ('fileName' in item) { // SolutionHistoryItem
            icon = item.type === 'solution-pdf' 
                ? <FileTextIcon className="w-5 h-5 text-red-500 flex-shrink-0" /> 
                : <CameraIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />;
            description = <>Giải bài tập từ <span className="font-semibold">{item.fileName}</span></>;
        } else { // AIToolHistoryItem
            icon = item.type === 'flashcards' 
                ? <ClipboardIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> 
                : <BookOpenIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
            const toolName = item.type === 'flashcards' ? 'flashcard' : 'tóm tắt';
            description = <>Tạo {toolName} từ văn bản <span className="italic">"{item.sourceTextSnippet}"</span></>;
        }

        return (
            <li key={item.timestamp} className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {icon}
                </div>
                <div>
                    <p className="text-gray-700">{description}</p>
                    <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString('vi-VN')}</p>
                </div>
            </li>
        );
    };


    const getProgressCategories = (grade: Grade): string[] => {
        const allSubjects = getSubjectsByGrade(grade);
        const categories = new Set<string>();
        allSubjects.forEach(subject => {
            if (subject === "Toán") categories.add("Toán");
            else if (subject === "Ngữ Văn" || subject === "Tiếng Việt") categories.add("Ngữ Văn");
            else if (subject === "Tiếng Anh") categories.add("Tiếng Anh");
            else if (subject === "Khoa học tự nhiên") categories.add("Khoa học tự nhiên");
        });
        // Added handling for PDF and Image subjects which can be any category
        practiceHistory.forEach(attempt => {
            if (attempt.subject === "Bài tập PDF" || attempt.subject === "Bài tập Ảnh") {
                 categories.add(attempt.subject);
            }
        });
        return Array.from(categories);
    };

    const getSubjectsForCategory = (category: string): Subject[] => {
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

    const getIconForCategory = (category: string) => {
        switch (category) {
            case 'Toán': return <CalculatorIcon className="w-8 h-8" />;
            case 'Ngữ Văn': return <BookOpenIcon className="w-8 h-8" />;
            case 'Tiếng Anh': return <GlobeIcon className="w-8 h-8" />;
            case 'Khoa học tự nhiên': return <AtomIcon className="w-8 h-8" />;
            case 'Bài tập PDF': return <FileTextIcon className="w-8 h-8" />;
            case 'Bài tập Ảnh': return <CameraIcon className="w-8 h-8" />;
            default: return <CheckSquareIcon className="w-8 h-8" />;
        }
    }
    
    const calculateCategoryStats = (category: string) => {
        const subjects = getSubjectsForCategory(category);
        const attempts = practiceHistory.filter(att => subjects.includes(att.subject));
        const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
        const totalQuestions = attempts.reduce((sum, att) => sum + att.total, 0);
        const avg = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        return { attemptsCount: attempts.length, avg };
    };

    const CATEGORIES = getProgressCategories(9);

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center">
                    <div>
                        <h3 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h3>
                        <p className="text-cyan-100 mb-6">Sẵn sàng cho những thử thách mới hôm nay chưa?</p>
                        <button onClick={() => setActiveView('practice')} className="bg-white text-cyan-700 font-semibold px-6 py-2 rounded-full hover:bg-cyan-100 transition-transform hover:scale-105">
                            Bắt đầu luyện tập
                        </button>
                    </div>
                    <TeacherCharacter className="w-48 h-auto ml-auto hidden md:block" />
                </Card>
                <Card className="lg:col-span-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 flex-shrink-0">Lịch sử hoạt động</h3>
                    {recentActivities.length > 0 ? (
                        <ul className="space-y-3 -mx-2 px-2 flex-grow overflow-y-auto">
                            {recentActivities.map(item => renderActivityItem(item))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <ClipboardIcon className="w-12 h-12 mb-2"/>
                            <p className="text-sm text-center">Chưa có hoạt động nào gần đây.</p>
                        </div>
                    )}
                </Card>
            </div>
             <Card className="mt-8 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 cursor-pointer" onClick={() => setActiveView('studyPlan')}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-20 h-20 bg-purple-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CalendarDaysIcon className="w-10 h-10"/>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-purple-800">Lộ trình học tập của bạn</h3>
                        <p className="text-gray-600 mt-1">Xem và tùy chỉnh kế hoạch học tập hàng tuần do AI tạo ra để giúp bạn đạt được mục tiêu.</p>
                    </div>
                    <button className="ml-auto bg-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-purple-700 transition-transform hover:scale-105 whitespace-nowrap">
                        Xem kế hoạch
                    </button>
                </div>
            </Card>
             <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Tiến độ của bạn</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {CATEGORIES.map(category => {
                        const stats = calculateCategoryStats(category);
                        const icon = getIconForCategory(category);

                        return (
                            <Card key={category} className="cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => onSelectProgressCategory(category)}>
                                <div className="flex items-start justify-between">
                                    <div className={`w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500`}>
                                        {icon}
                                    </div>
                                    {stats.attemptsCount > 0 &&
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-500">{stats.avg}%</p>
                                            <p className="text-xs text-gray-400">trung bình</p>
                                        </div>
                                    }
                                </div>
                                <h4 className="font-bold text-lg text-gray-800 mt-4">{category}</h4>
                                <p className="text-sm text-gray-500">{stats.attemptsCount} bài đã làm</p>
                            </Card>
                        )
                     })}
                 </div>
            </div>
        </div>
    )
}

const AIStudyTools: React.FC<{onAddAIToolHistory: (item: AIToolHistoryItem) => void}> = ({ onAddAIToolHistory }) => {
    const [inputMode, setInputMode] = useState<'text' | 'file' | 'camera'>('text');
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState({ flashcards: false, summary: false, textExtraction: false });

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            if (inputMode !== 'camera' || capturedImage) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập của bạn.");
                setInputMode('text');
            }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        if (inputMode === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }

        return () => stopCamera();
    }, [inputMode, capturedImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 15 * 1024 * 1024) {
                alert("Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 15MB.");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleExtractTextFromFile = async () => {
        if (!file) return;
        setIsLoading(prev => ({ ...prev, textExtraction: true }));
        setTextInput('Đang trích xuất, vui lòng chờ...');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const extracted = await extractTextFromFile(base64String, file.type);
            setTextInput(extracted);
            setIsLoading(prev => ({ ...prev, textExtraction: false }));
        };
        reader.onerror = () => {
            alert("Đã xảy ra lỗi khi đọc tệp.");
            setTextInput('');
            setIsLoading(prev => ({ ...prev, textExtraction: false }));
        };
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleExtractTextFromImage = async () => {
        if (!capturedImage) return;
        setIsLoading(prev => ({ ...prev, textExtraction: true }));
        setTextInput('Đang trích xuất, vui lòng chờ...');
        try {
            const base64String = capturedImage.split(',')[1];
            const mimeType = capturedImage.match(/:(.*?);/)?.[1] || 'image/jpeg';
            const extracted = await extractTextFromFile(base64String, mimeType);
            setTextInput(extracted);
        } catch (error) {
            alert("Đã xảy ra lỗi khi trích xuất văn bản từ ảnh.");
            setTextInput('');
        } finally {
            setIsLoading(prev => ({ ...prev, textExtraction: false }));
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!textInput.trim()) return;
        setIsLoading(prev => ({ ...prev, flashcards: true }));
        setFlashcards([]);
        setSummary('');
        const cards = await generateFlashcards(textInput);
        setFlashcards(cards);
        setIsLoading(prev => ({ ...prev, flashcards: false }));
        if (cards.length > 0) {
            onAddAIToolHistory({
                type: 'flashcards',
                sourceTextSnippet: textInput.substring(0, 40) + (textInput.length > 40 ? '...' : ''),
                timestamp: Date.now()
            });
        }
    };

    const handleGenerateSummary = async () => {
        if (!textInput.trim()) return;
        setIsLoading(prev => ({ ...prev, summary: true }));
        setFlashcards([]);
        setSummary('');
        const result = await generateSummary(textInput);
        setSummary(result);
        setIsLoading(prev => ({ ...prev, summary: false }));
        if (result && !result.toLowerCase().includes('không thể')) {
            onAddAIToolHistory({
                type: 'summary',
                sourceTextSnippet: textInput.substring(0, 40) + (textInput.length > 40 ? '...' : ''),
                timestamp: Date.now()
            });
        }
    };

    const resetInputs = (mode: 'text' | 'file' | 'camera') => {
        setInputMode(mode);
        setFile(null);
        setCapturedImage(null);
    };

    return (
        <div className="space-y-6 animate__animated animate__fadeIn">
            <Card>
                <h3 className="text-xl font-bold mb-2">Công cụ học tập từ AI</h3>
                <p className="text-gray-600 mb-4">Tạo flashcard hoặc tóm tắt ngay lập tức từ văn bản, tệp hoặc ảnh chụp.</p>
                <div className="flex border-b mb-4">
                    <button onClick={() => resetInputs('text')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${inputMode === 'text' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}>
                        <ClipboardIcon className="w-5 h-5" /> Dán văn bản
                    </button>
                    <button onClick={() => resetInputs('file')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${inputMode === 'file' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}>
                        <FileTextIcon className="w-5 h-5" /> Tải lên tệp
                    </button>
                    <button onClick={() => resetInputs('camera')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${inputMode === 'camera' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}>
                        <CameraIcon className="w-5 h-5" /> Chụp ảnh
                    </button>
                </div>

                {inputMode === 'file' && (
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-gray-600 font-semibold text-center">
                                {file ? file.name : 'Nhấn để chọn tệp (PDF, PNG, JPG)'}
                            </span>
                            <p className="text-xs text-gray-500">Tối đa 15MB</p>
                            <input id="file-upload" type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                        </label>
                        <button
                            onClick={handleExtractTextFromFile}
                            disabled={!file || isLoading.textExtraction}
                            className="w-full bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading.textExtraction ? 'Đang trích xuất...' : 'Trích xuất văn bản'}
                        </button>
                    </div>
                )}
                
                {inputMode === 'camera' && (
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="w-full relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-inner">
                            {capturedImage ? (
                                <img src={capturedImage} alt="Ảnh đã chụp" className="w-full h-full object-contain" />
                            ) : (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        <div className="w-full flex gap-4">
                            {capturedImage ? (
                                <>
                                    <button onClick={handleRetake} className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                                        Chụp lại
                                    </button>
                                    <button
                                        onClick={handleExtractTextFromImage}
                                        disabled={isLoading.textExtraction}
                                        className="flex-1 bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        {isLoading.textExtraction ? 'Đang trích xuất...' : 'Trích xuất văn bản'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleCapture} className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
                                    <CameraIcon className="w-5 h-5" />
                                    Chụp ảnh
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                        isLoading.textExtraction
                        ? "Đang trích xuất văn bản, vui lòng chờ..."
                        : inputMode === 'text' 
                        ? "Dán văn bản của bạn vào đây..." 
                        : "Văn bản được trích xuất sẽ xuất hiện ở đây. Bạn có thể chỉnh sửa trước khi tạo..."
                    }
                    className="w-full h-40 p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-300 focus:outline-none"
                    disabled={isLoading.textExtraction}
                />
                
                <div className="flex gap-4 mt-4">
                    <button onClick={handleGenerateFlashcards} disabled={isLoading.flashcards || !textInput.trim()} className="flex-1 bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center gap-2">
                        <ClipboardIcon className="w-5 h-5" /> {isLoading.flashcards ? 'Đang tạo...' : 'Tạo Flashcard'}
                    </button>
                    <button onClick={handleGenerateSummary} disabled={isLoading.summary || !textInput.trim()} className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center gap-2">
                        <BookOpenIcon className="w-5 h-5" /> {isLoading.summary ? 'Đang tạo...' : 'Tạo Tóm Tắt'}
                    </button>
                </div>
            </Card>

            {flashcards.length > 0 && (
                <Card>
                    <h3 className="text-xl font-bold mb-4">Flashcard đã tạo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {flashcards.map((card, index) => (
                             <div key={index} className="flip-card aspect-video">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front bg-cyan-100 p-4 rounded-lg flex items-center justify-center text-center font-semibold text-cyan-800">
                                        {card.question}
                                    </div>
                                    <div className="flip-card-back bg-cyan-200 p-4 rounded-lg flex items-center justify-center text-center text-cyan-900">
                                        {card.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {summary && (
                <Card>
                    <h3 className="text-xl font-bold mb-4">Tóm tắt đã tạo</h3>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <MarkdownRenderer content={summary} />
                    </div>
                </Card>
            )}
            <style>{`
                .flip-card { perspective: 1000px; }
                .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
                .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
                .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
                .flip-card-back { transform: rotateY(180deg); }
            `}</style>
        </div>
    )
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingProgressCategory, setViewingProgressCategory] = useState<string | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeAttempt[]>([]);
  const [solutionHistory, setSolutionHistory] = useState<SolutionHistoryItem[]>([]);
  const [aiToolHistory, setAIToolHistory] = useState<AIToolHistoryItem[]>([]);
  const [tutorSessions, setTutorSessions] = useState<AITutorSession[]>([]);
  const [activeTutorSessionId, setActiveTutorSessionId] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState<PracticeAttempt | null>(null);
  const [planPracticeRequest, setPlanPracticeRequest] = useState<PlanPracticeRequest | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);


  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedDataJSON = localStorage.getItem('learnTogetherData');
      if (savedDataJSON) {
        const savedData = JSON.parse(savedDataJSON);
        if (savedData.activeView) setActiveView(savedData.activeView);
        if (savedData.practiceHistory) setPracticeHistory(savedData.practiceHistory);
        if (savedData.solutionHistory) setSolutionHistory(savedData.solutionHistory);
        if (savedData.aiToolHistory) setAIToolHistory(savedData.aiToolHistory);
        if (savedData.weeklyPlan) setWeeklyPlan(savedData.weeklyPlan);
        
        if (savedData.tutorSessions && savedData.tutorSessions.length > 0) {
            setTutorSessions(savedData.tutorSessions);
            setActiveTutorSessionId(savedData.activeTutorSessionId || savedData.tutorSessions[0].id);
        } else {
            // Create initial session if none exists
            const newSessionId = `session-${Date.now()}`;
            const initialSession: AITutorSession = {
                id: newSessionId,
                timestamp: Date.now(),
                title: "Cuộc trò chuyện mới",
                messages: INITIAL_TUTOR_MESSAGE
            };
            setTutorSessions([initialSession]);
            setActiveTutorSessionId(newSessionId);
        }
      } else {
         // Also create initial session if there is no saved data at all
         const newSessionId = `session-${Date.now()}`;
         const initialSession: AITutorSession = {
             id: newSessionId,
             timestamp: Date.now(),
             title: "Cuộc trò chuyện mới",
             messages: INITIAL_TUTOR_MESSAGE
         };
         setTutorSessions([initialSession]);
         setActiveTutorSessionId(newSessionId);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToSave = {
        activeView,
        practiceHistory,
        solutionHistory,
        aiToolHistory,
        tutorSessions,
        activeTutorSessionId,
        weeklyPlan,
      };
      localStorage.setItem('learnTogetherData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [activeView, practiceHistory, solutionHistory, aiToolHistory, tutorSessions, activeTutorSessionId, weeklyPlan]);

  const handleAddPracticeAttempt = (attempt: PracticeAttempt) => {
    setPracticeHistory(prev => [...prev, attempt]);
  };
  
  const handleAddSolutionHistory = (item: SolutionHistoryItem) => {
    setSolutionHistory(prev => [item, ...prev].slice(0, 50)); // Keep history to a reasonable size
  };

  const handleAddAIToolHistory = (item: AIToolHistoryItem) => {
      setAIToolHistory(prev => [item, ...prev].slice(0, 50));
  };

  const handleSelectProgressCategory = (category: string) => {
    setViewingProgressCategory(category);
    setActiveView('progressDetail');
  };
  
  const handleRetryQuiz = (attempt: PracticeAttempt) => {
    setRetryAttempt(attempt);
    setActiveView('practice');
  };

  const handlePracticeFromPlan = (request: PlanPracticeRequest) => {
      setPlanPracticeRequest(request);
      setActiveView('practice');
  };

  // AI Tutor Session Handlers
  const handleNewTutorSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: AITutorSession = {
        id: newSessionId,
        timestamp: Date.now(),
        title: "Cuộc trò chuyện mới",
        messages: INITIAL_TUTOR_MESSAGE,
    };
    setTutorSessions(prev => [newSession, ...prev]);
    setActiveTutorSessionId(newSessionId);
  }, []);

  const handleSelectTutorSession = (id: string) => {
    setActiveTutorSessionId(id);
  };

  const handleUpdateTutorSessionMessages = (sessionId: string, newMessages: AITutorMessage[]) => {
    setTutorSessions(prevSessions => {
        return prevSessions.map(session => {
            if (session.id === sessionId) {
                const needsTitle = session.messages.length === 1 && newMessages.length > 1;
                let newTitle = session.title;
                if (needsTitle) {
                    const userMessage = newMessages.find(m => m.role === 'user')?.text || '';
                    newTitle = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
                }
                
                return { ...session, messages: newMessages, title: newTitle || "Cuộc trò chuyện mới" };
            }
            return session;
        });
    });
  };

  const handleDeleteTutorSession = (sessionId: string) => {
    setTutorSessions(prev => {
        const remainingSessions = prev.filter(s => s.id !== sessionId);
        if (activeTutorSessionId === sessionId) {
            if (remainingSessions.length > 0) {
                // Select the most recent session
                setActiveTutorSessionId(remainingSessions.sort((a,b) => b.timestamp - a.timestamp)[0].id);
            } else {
                // If all are deleted, create a new one
                const newSessionId = `session-${Date.now()}`;
                const initialSession: AITutorSession = {
                    id: newSessionId,
                    timestamp: Date.now(),
                    title: "Cuộc trò chuyện mới",
                    messages: INITIAL_TUTOR_MESSAGE,
                };
                setActiveTutorSessionId(newSessionId);
                return [initialSession];
            }
        }
        return remainingSessions;
    });
  };

  const prevActiveViewRef = useRef(activeView);
  useEffect(() => {
    // This effect runs after every render.
    // We check if the activeView has changed since the last render.
    if (prevActiveViewRef.current !== activeView) {
        // If we are navigating TO the tutor view and we were NOT on the tutor view before.
        if (activeView === 'tutor' && prevActiveViewRef.current !== 'tutor') {
            const activeSession = tutorSessions.find(s => s.id === activeTutorSessionId);
            // We only start a new session if the previous one was actually used (i.e., has more than the initial greeting).
            if (activeSession && activeSession.messages.length > 1) {
                handleNewTutorSession();
            }
        }
    }
    // Update the ref to the current view for the next check.
    prevActiveViewRef.current = activeView;
  }, [activeView, tutorSessions, activeTutorSessionId, handleNewTutorSession]);


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
            setActiveView={setActiveView} 
            practiceHistory={practiceHistory} 
            solutionHistory={solutionHistory}
            aiToolHistory={aiToolHistory}
            onSelectProgressCategory={handleSelectProgressCategory} 
        />;
      case 'homework':
        return <HomeworkView 
            onAddSolutionHistory={handleAddSolutionHistory}
        />;
      case 'practice':
        return <PracticeView 
            onQuizComplete={handleAddPracticeAttempt}
            retryAttempt={retryAttempt}
            onRetryHandled={() => setRetryAttempt(null)}
            planPracticeRequest={planPracticeRequest}
            onPlanPracticeHandled={() => setPlanPracticeRequest(null)}
        />;
      case 'tools':
        return <AIStudyTools onAddAIToolHistory={handleAddAIToolHistory} />;
      case 'studyPlan':
        return <StudyPlanView 
            practiceHistory={practiceHistory}
            weeklyPlan={weeklyPlan}
            setWeeklyPlan={setWeeklyPlan}
            onPracticeFromPlan={handlePracticeFromPlan}
        />;
      case 'progressDetail':
        return <ProgressDetailView 
            category={viewingProgressCategory} 
            history={practiceHistory} 
            setActiveView={setActiveView}
            onRetryQuiz={handleRetryQuiz}
        />;
      case 'tutor':
        const activeSession = tutorSessions.find(s => s.id === activeTutorSessionId);
        return <AITutor
            sessions={tutorSessions}
            activeSession={activeSession}
            onSelectSession={handleSelectTutorSession}
            onNewSession={handleNewTutorSession}
            onUpdateSessionMessages={handleUpdateTutorSessionMessages}
            onDeleteSession={handleDeleteTutorSession}
        />;
      default:
        return <Dashboard 
            setActiveView={setActiveView} 
            practiceHistory={practiceHistory} 
            solutionHistory={solutionHistory}
            aiToolHistory={aiToolHistory}
            onSelectProgressCategory={handleSelectProgressCategory} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex flex-col h-screen">
        <Header 
            activeView={activeView} 
            onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}