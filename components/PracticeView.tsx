import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Subject, PracticeQuestion, PracticeAttempt, Grade, OpenEndedQuestion, OpenEndedFeedback, ExamPeriod, AnyMockExam, MockExamOpenEnded, PlanPracticeRequest } from '../types';
import { GRADES, getSubjectsByGrade } from '../constants';
import { MOCK_EXAMS } from '../data/mockExams';
import { 
    CalculatorIcon, BookOpenIcon, GlobeIcon, AtomIcon,
    CheckSquareIcon, SparklesIcon, FileTextIcon, UploadCloudIcon, CameraIcon, XIcon, LightbulbIcon,
    LandmarkIcon, ScaleIcon
} from './Icons';
import { generatePracticeQuestionsFromPdf, generatePracticeQuestionsFromImage, getExplanationForIncorrectAnswer, getPracticeRecommendations, generateOpenEndedQuestionsFromPdf, generateOpenEndedQuestionsFromImage, gradeOpenEndedAnswer, gradeOpenEndedAnswerFromImage, generateFollowUpExercises, generatePracticeQuestionsFromTopic, generateMixedPracticeTest } from '../services/geminiService';
import { QuizResultDetails } from './QuizResultDetails';
import { MarkdownRenderer } from './MarkdownRenderer';


export const PracticeView: React.FC<{ 
    onQuizComplete: (attempt: PracticeAttempt) => void; 
    retryAttempt: PracticeAttempt | null;
    onRetryHandled: () => void;
    planPracticeRequest: PlanPracticeRequest | null;
    onPlanPracticeHandled: () => void;
}> = ({ onQuizComplete, retryAttempt, onRetryHandled, planPracticeRequest, onPlanPracticeHandled }) => {
    type Mode = 'selection' | 'exam_period_selection' | 'sample_exam_selection' | 'pdf_upload' | 'image_upload' | 'configure_quiz' | 'ready' | 'quiz' | 'results' | 'quiz_open_ended' | 'results_open_ended' | 'solve_open_ended_exam' | 'generating_from_plan';
    
    const [mode, setMode] = useState<Mode>('selection');
    const [currentQuizTopic, setCurrentQuizTopic] = useState<Subject | null>(null);
    const [currentQuizTitle, setCurrentQuizTitle] = useState<string>('');
    const [selectedGrade] = useState<Grade>(9);
    const [selectedExamPeriod, setSelectedExamPeriod] = useState<ExamPeriod | null>(null);
    
    // States for pre-defined open-ended exams
    const [activeOpenEndedExam, setActiveOpenEndedExam] = useState<MockExamOpenEnded | null>(null);
    const [openEndedUserAnswers, setOpenEndedUserAnswers] = useState<{ [key: number]: { text?: string; image?: string } }>({});
    const [openEndedFeedbacks, setOpenEndedFeedbacks] = useState<{ [key: number]: OpenEndedFeedback | null }>({});
    const [capturedImageForAnswer, setCapturedImageForAnswer] = useState<string | null>(null);


    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [currentQuestions, setCurrentQuestions] = useState<PracticeQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [recommendations, setRecommendations] = useState('');
    const [explanations, setExplanations] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    // New states for quiz configuration and generated open-ended flow
    const [numQuestions, setNumQuestions] = useState(10);
    const [questionType, setQuestionType] = useState<'mcq' | 'open-ended'>('mcq');
    const [generatedOpenEndedQuestions, setGeneratedOpenEndedQuestions] = useState<OpenEndedQuestion[]>([]);
    const [currentUserAnswer, setCurrentUserAnswer] = useState('');
    const [currentFeedback, setCurrentFeedback] = useState<OpenEndedFeedback | null>(null);
    const [followUpExercises, setFollowUpExercises] = useState<PracticeQuestion[]>([]);
    const [generatedQuizSubject, setGeneratedQuizSubject] = useState<Subject | null>(null);
    const [openEndedForMixedQuiz, setOpenEndedForMixedQuiz] = useState<OpenEndedQuestion[]>([]);

    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const score = currentQuestions.reduce((acc, question, index) => {
        return answers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    const resetState = () => {
        setMode('selection');
        setCurrentQuizTopic(null);
        setCurrentQuizTitle('');
        setSelectedExamPeriod(null);
        setActiveOpenEndedExam(null);
        setPdfFile(null);
        setImageFile(null);
        setImagePreview(null);
        setShowCamera(false);
        setCurrentQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setRecommendations('');
        setExplanations({});
        setIsLoading(false);
        // Reset open-ended states
        setNumQuestions(10);
        setQuestionType('mcq');
        setGeneratedOpenEndedQuestions([]);
        setCurrentUserAnswer('');
        setCurrentFeedback(null);
        setFollowUpExercises([]);
        setGeneratedQuizSubject(null);
        setOpenEndedUserAnswers({});
        setOpenEndedFeedbacks({});
        setCapturedImageForAnswer(null);
        setOpenEndedForMixedQuiz([]);
    };

    useEffect(() => {
        if (retryAttempt) {
            setCurrentQuizTopic(retryAttempt.subject);
            setCurrentQuizTitle(retryAttempt.title);
            setCurrentQuestions(retryAttempt.questions);
            setMode('ready');
            onRetryHandled(); // Clear the state in App
        }
    }, [retryAttempt, onRetryHandled]);

     useEffect(() => {
        const handlePlanRequest = async () => {
            if (planPracticeRequest) {
                setMode('generating_from_plan');
                setIsLoading(true);
                const { subject, topic, numMcq, numOpenEnded } = planPracticeRequest;
                const result = await generateMixedPracticeTest(subject, topic, numMcq, numOpenEnded);
                
                if (result && (result.mcq.length > 0 || result.openEnded.length > 0)) {
                    setCurrentQuizTopic(subject);
                    setCurrentQuizTitle(`Luyện tập: ${topic}`);
                    if (result.mcq.length > 0) {
                        setCurrentQuestions(result.mcq);
                        setOpenEndedForMixedQuiz(result.openEnded);
                        setMode('ready');
                    } else { // No MCQs, go straight to open-ended
                        setGeneratedOpenEndedQuestions(result.openEnded);
                        setGeneratedQuizSubject(subject);
                        setCurrentQuestionIndex(0);
                        setMode('quiz_open_ended');
                    }
                } else {
                    alert(`Không thể tạo bài tập cho chủ đề "${topic}". Vui lòng thử lại.`);
                    setMode('selection');
                }
                setIsLoading(false);
                onPlanPracticeHandled();
            }
        };
        handlePlanRequest();
    }, [planPracticeRequest, onPlanPracticeHandled]);
    
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập của bạn.");
                setShowCamera(false);
            }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        if (showCamera) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [showCamera]);

    const handleSelectSubject = (subject: Subject) => {
        setCurrentQuizTopic(subject);
        setMode('exam_period_selection');
    };

    const handleSelectExamPeriod = (period: ExamPeriod) => {
        setSelectedExamPeriod(period);
        setMode('sample_exam_selection');
    };
    
    const handleSelectExam = (exam: AnyMockExam) => {
        if (exam.type === 'open-ended') {
            setActiveOpenEndedExam(exam);
            setMode('solve_open_ended_exam');
            setCurrentQuestionIndex(0);
            setOpenEndedUserAnswers({});
            setOpenEndedFeedbacks({});
        } else { // MCQ
            setCurrentQuestions(exam.questions);
            setCurrentQuizTitle(exam.title);
            setMode('ready');
        }
    };

    const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) { // 15MB limit
                alert("Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 15MB.");
                return;
            }
            setPdfFile(file);
        }
    };
    
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) { // 15MB limit
                alert("Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 15MB.");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
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
                if (mode === 'solve_open_ended_exam') {
                    setCapturedImageForAnswer(dataUrl);
                } else {
                    setImagePreview(dataUrl);
                    setImageFile(null); // Clear any uploaded file
                }
                setShowCamera(false);
            }
        }
    };

    const handleFinalizeQuizCreation = async () => {
        if (!pdfFile && !imagePreview && !imageFile) {
            alert("Lỗi: Không tìm thấy tệp nguồn.");
            return;
        }
        setIsLoading(true);

        const processFile = async (base64String: string, mimeType: string) => {
            try {
                if (questionType === 'mcq') {
                    const result = pdfFile
                        ? await generatePracticeQuestionsFromPdf(base64String, numQuestions)
                        : await generatePracticeQuestionsFromImage(base64String, mimeType, numQuestions);
                    
                    if (!result || result.questions.length === 0) {
                        alert('Không thể tạo câu hỏi trắc nghiệm từ tệp này. Vui lòng thử lại.');
                        return;
                    }
                    setCurrentQuizTopic(result.subject);
                    setCurrentQuestions(result.questions);
                    setCurrentQuizTitle(`Bài tập từ ${pdfFile ? 'PDF' : 'Ảnh'} (${new Date().toLocaleDateString('vi-VN')})`);
                    setMode('ready');

                } else { // open-ended
                    const result = pdfFile
                        ? await generateOpenEndedQuestionsFromPdf(base64String)
                        : await generateOpenEndedQuestionsFromImage(base64String, mimeType);
                    
                    if (!result || result.questions.length === 0) {
                        alert('Không thể tạo câu hỏi tự luận từ tệp này. Vui lòng thử lại.');
                        return;
                    }
                    setGeneratedQuizSubject(result.subject);
                    setGeneratedOpenEndedQuestions(result.questions);
                    setCurrentQuestionIndex(0);
                    setCurrentQuizTitle(`Bài tập từ ${pdfFile ? 'PDF' : 'Ảnh'} (${new Date().toLocaleDateString('vi-VN')})`);
                    setMode('quiz_open_ended');
                }
            } catch (error) {
                alert("Đã có lỗi xảy ra khi tạo bài tập. Vui lòng thử lại.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        
        const file = pdfFile || imageFile;
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                processFile(base64String, file.type);
            };
            reader.onerror = () => {
                alert("Đã xảy ra lỗi khi đọc tệp.");
                setIsLoading(false);
            };
        } else if (imagePreview) {
            const base64String = imagePreview.split(',')[1];
            const mimeType = imagePreview.match(/:(.*?);/)?.[1] || 'image/jpeg';
            processFile(base64String, mimeType);
        }
    };

    const handleAnswer = (questionIndex: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
        if (questionIndex < currentQuestions.length - 1) {
            setCurrentQuestionIndex(questionIndex + 1);
        } else {
            setMode('results');
        }
    };
    
    // Fetch explanations and recommendations on results page
    useEffect(() => {
        const fetchFeedback = async () => {
            if (mode === 'results' && currentQuizTopic) {
                setIsLoading(true);

                const wrongAnswers = currentQuestions.filter((q, i) => answers[i] && q.correctAnswer !== answers[i]);
                const weakTopics: string[] = Array.from(new Set(wrongAnswers.map((q: PracticeQuestion) => q.topic)));
                
                const newExplanations: { [key: number]: string } = {};
                
                // Generate explanations sequentially to avoid rate limiting errors.
                for (const q of wrongAnswers) {
                    const qIndex = currentQuestions.findIndex(cq => cq.question === q.question);
                    try {
                        const explanation = await getExplanationForIncorrectAnswer(q.question, answers[qIndex], q.correctAnswer);
                        newExplanations[qIndex] = explanation;
                    } catch (error) {
                        console.error(`Error generating explanation for question ${qIndex}:`, error);
                        newExplanations[qIndex] = "Rất tiếc, đã có lỗi khi tạo giải thích cho câu hỏi này.";
                    }
                }
                
                let recs = '';
                try {
                    recs = await getPracticeRecommendations(weakTopics);
                } catch(error) {
                    console.error("Error generating recommendations:", error);
                    recs = "Rất tiếc, đã có lỗi khi tạo đề xuất luyện tập.";
                }

                const finalScore = currentQuestions.reduce((acc, question, index) => {
                    return answers[index] === question.correctAnswer ? acc + 1 : acc;
                }, 0);

                const attempt: PracticeAttempt = {
                    title: currentQuizTitle || `Luyện tập ${currentQuizTopic}`,
                    subject: currentQuizTopic,
                    questions: currentQuestions,
                    answers: answers,
                    score: finalScore,
                    total: currentQuestions.length,
                    timestamp: Date.now(),
                    explanations: newExplanations,
                };
                
                onQuizComplete(attempt);
                setExplanations(newExplanations);
                setRecommendations(recs);
                setIsLoading(false);
            }
        };
        fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const handleGradeGeneratedAnswer = async () => {
        if (!currentUserAnswer.trim()) {
            alert("Vui lòng nhập câu trả lời của bạn.");
            return;
        }
        setIsLoading(true);
        setCurrentFeedback(null);
        setFollowUpExercises([]);

        const question = generatedOpenEndedQuestions[currentQuestionIndex];
        const feedback = await gradeOpenEndedAnswer(question, currentUserAnswer);

        if (feedback) {
            setCurrentFeedback(feedback);
            if (feedback.weaknesses && feedback.weaknesses.length > 0) {
                const exercises = await generateFollowUpExercises(generatedQuizSubject!, question.topic, feedback.weaknesses);
                if (exercises) {
                    setFollowUpExercises(exercises);
                }
            }
        } else {
            alert("Đã xảy ra lỗi khi chấm điểm. Vui lòng thử lại.");
        }

        setIsLoading(false);
        setMode('results_open_ended');
    };
    
    const handleGradeMockExamAnswer = async () => {
        const textAnswer = openEndedUserAnswers[currentQuestionIndex]?.text;
        const imageAnswer = openEndedUserAnswers[currentQuestionIndex]?.image;

        if (!textAnswer && !imageAnswer) {
            alert("Vui lòng nhập câu trả lời hoặc chụp ảnh bài làm.");
            return;
        }
        setIsLoading(true);
        
        const question = activeOpenEndedExam!.questions[currentQuestionIndex];
        let feedback: OpenEndedFeedback | null = null;

        if (textAnswer) {
            feedback = await gradeOpenEndedAnswer(question, textAnswer);
        } else if (imageAnswer) {
            const base64String = imageAnswer.split(',')[1];
            const mimeType = imageAnswer.match(/:(.*?);/)?.[1] || 'image/jpeg';
            feedback = await gradeOpenEndedAnswerFromImage(question, base64String, mimeType);
        }
        
        if (feedback) {
            setOpenEndedFeedbacks(prev => ({ ...prev, [currentQuestionIndex]: feedback }));
        } else {
            alert("Đã có lỗi xảy ra khi chấm điểm. Vui lòng thử lại.");
        }

        setIsLoading(false);
    };


    const handleNextOpenEndedQuestion = () => {
        const totalQuestions = activeOpenEndedExam ? activeOpenEndedExam.questions.length : generatedOpenEndedQuestions.length;
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentUserAnswer('');
            setCurrentFeedback(null);
            setFollowUpExercises([]);
            setCapturedImageForAnswer(null);
            if(mode !== 'solve_open_ended_exam') setMode('quiz_open_ended');
        } else {
            resetState(); // If it's the last question, go back to selection
        }
    };
    
    const renderFileUploadScreen = (uploadType: 'pdf' | 'image') => {
        const title = uploadType === 'pdf' ? 'Tạo bài tập từ PDF' : 'Tạo bài tập từ Ảnh';
        const acceptType = uploadType === 'pdf' ? 'application/pdf' : 'image/*';
        const handleFileChange = uploadType === 'pdf' ? handlePdfFileChange : handleImageFileChange;
        const file = uploadType === 'pdf' ? pdfFile : imageFile;
        const preview = imagePreview;

        return (
            <div className="animate__animated animate__fadeIn max-w-2xl mx-auto">
                <button onClick={resetState} className="mb-4 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300">&larr; Quay lại</button>
                <Card>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{title}</h3>
                    
                    <div className="space-y-4">
                        {uploadType === 'image' && preview ? (
                             <div className="flex flex-col items-center gap-4">
                                <p className="font-semibold">Xem trước ảnh:</p>
                                <img src={preview} alt="Xem trước" className="max-h-60 rounded-lg border shadow-sm" />
                                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">
                                    Chọn ảnh khác
                                </button>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center gap-4">
                                <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
                                    <span className="text-gray-600 font-semibold text-center">
                                        {file ? file.name : `Nhấn để chọn tệp ${uploadType === 'pdf' ? 'PDF' : 'Ảnh'}`}
                                    </span>
                                    <p className="text-xs text-gray-500">Tối đa 15MB</p>
                                    <input id="file-upload" type="file" className="hidden" accept={acceptType} onChange={handleFileChange} />
                                </label>

                                {uploadType === 'image' && (
                                    <>
                                        <div className="flex items-center w-full">
                                            <hr className="flex-grow border-t border-gray-300" />
                                            <span className="px-4 text-gray-500">hoặc</span>
                                            <hr className="flex-grow border-t border-gray-300" />
                                        </div>
                                        <button onClick={() => setShowCamera(true)} className="w-full bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2">
                                            <CameraIcon className="w-5 h-5" /> Sử dụng camera
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Tuỳ chỉnh bài tập</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Loại câu hỏi</label>
                                <select value={questionType} onChange={(e) => setQuestionType(e.target.value as 'mcq' | 'open-ended')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="mcq">Trắc nghiệm</option>
                                    <option value="open-ended">Tự luận</option>
                                </select>
                            </div>
                            {questionType === 'mcq' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lượng câu hỏi</label>
                                    <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="20" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button 
                            onClick={handleFinalizeQuizCreation} 
                            disabled={isLoading || (!pdfFile && !imageFile && !imagePreview)}
                            className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-all"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading ? 'Đang tạo...' : 'Tạo bài tập'}
                        </button>
                    </div>
                </Card>

                {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 max-w-lg w-full animate__animated animate__fadeInUp animate__faster">
                            <h3 className="text-lg font-bold mb-2">Chụp ảnh</h3>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-gray-900 aspect-video object-cover"></video>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowCamera(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Hủy</button>
                                <button onClick={handleCapture} className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                                    <CameraIcon className="w-5 h-5" /> Chụp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    if (mode === 'selection') {
        const availableSubjects = getSubjectsByGrade(selectedGrade);

        return (
            <div className="animate__animated animate__fadeIn">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-2xl font-bold text-gray-800">Luyện tập & Thi cử Lớp 9</h3>
                </div>
                 <h4 className="text-lg font-semibold text-gray-700 mb-4">Luyện thi theo môn</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableSubjects.map(subject => (
                        <Card key={subject} className="text-center cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => handleSelectSubject(subject)}>
                            <div className="mx-auto w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mb-4 text-cyan-500">
                                {subject === 'Toán' && <CalculatorIcon className="w-8 h-8" />}
                                {subject === 'Ngữ Văn' && <BookOpenIcon className="w-8 h-8" />}
                                {subject === 'Tiếng Anh' && <GlobeIcon className="w-8 h-8" />}
                                {subject === 'Khoa học tự nhiên' && <AtomIcon className="w-8 h-8" />}
                            </div>
                            <h4 className="font-bold text-lg text-gray-800">{subject}</h4>
                            <p className="text-sm text-gray-500">Các kỳ thi giữa & cuối kỳ</p>
                        </Card>
                    ))}
                </div>
                 <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Tạo bài tập từ tài liệu</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="text-center cursor-pointer hover:-translate-y-1 transition-transform bg-purple-50 hover:bg-purple-100" onClick={() => setMode('pdf_upload')}>
                        <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-purple-500">
                            <FileTextIcon className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800">Luyện tập từ PDF</h4>
                        <p className="text-xs text-gray-400 mt-2">Tải lên và tạo bài tập</p>
                    </Card>
                    <Card className="text-center cursor-pointer hover:-translate-y-1 transition-transform bg-green-50 hover:bg-green-100" onClick={() => setMode('image_upload')}>
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-500">
                            <CameraIcon className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800">Luyện tập từ Ảnh</h4>
                        <p className="text-xs text-gray-400 mt-2">Tải lên hoặc Chụp ảnh</p>
                    </Card>
                 </div>
            </div>
        );
    }

    if (mode === 'pdf_upload') {
        return renderFileUploadScreen('pdf');
    }

    if (mode === 'image_upload') {
        return renderFileUploadScreen('image');
    }


    if (mode === 'exam_period_selection') {
        const periods: { key: ExamPeriod, name: string }[] = [
            { key: 'midterm1', name: 'Giữa kì 1' },
            { key: 'final1', name: 'Cuối kì 1' },
            { key: 'midterm2', name: 'Giữa kì 2' },
            { key: 'final2', name: 'Cuối kì 2' },
        ];
        return (
             <div className="animate__animated animate__fadeIn">
                <button onClick={() => setMode('selection')} className="mb-4 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300">&larr; Chọn môn khác</button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Chọn kỳ kiểm tra - Lớp {selectedGrade} {currentQuizTopic}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {periods.map(period => (
                        <Card key={period.key} className="text-center cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => handleSelectExamPeriod(period.key)}>
                            <div className="mx-auto w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mb-4 text-cyan-500">
                                <FileTextIcon className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-800">{period.name}</h4>
                        </Card>
                    ))}
                </div>
             </div>
        )
    }

    if (mode === 'sample_exam_selection') {
        const exams: AnyMockExam[] = MOCK_EXAMS[selectedGrade]?.[currentQuizTopic!]?.[selectedExamPeriod!] || [];
        const periodName = {midterm1: 'Giữa kì 1', final1: 'Cuối kì 1', midterm2: 'Giữa kì 2', final2: 'Cuối kì 2'}[selectedExamPeriod!];

        return (
            <div className="animate__animated animate__fadeIn">
                <button onClick={() => setMode('exam_period_selection')} className="mb-4 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300">&larr; Chọn kỳ khác</button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Chọn đề mẫu - {periodName} Lớp {selectedGrade}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <Card key={exam.id} className="cursor-pointer hover:shadow-cyan-100 hover:border-cyan-300 border-2 border-transparent transition-all" onClick={() => handleSelectExam(exam)}>
                           {exam.type === 'open-ended' 
                                ? <span className="absolute top-3 right-3 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Tự luận</span>
                                : <span className="absolute top-3 right-3 text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Trắc nghiệm</span>
                           }
                            <h4 className="font-bold text-lg text-cyan-700">{exam.title}</h4>
                            <p className="text-xs text-gray-400 mt-2">{exam.questions.length} câu hỏi</p>
                        </Card>
                    ))}
                     <Card className="cursor-pointer bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center text-center" onClick={() => setMode('pdf_upload')}>
                         <UploadCloudIcon className="w-10 h-10 text-green-500 mb-2" />
                        <h4 className="font-bold text-lg text-green-800">Tải lên đề của bạn</h4>
                        <p className="text-sm text-gray-500">Tạo bài thi từ file PDF, ảnh...</p>
                    </Card>
                </div>
            </div>
        );
    }
    
    if (mode === 'solve_open_ended_exam' && activeOpenEndedExam) {
        const question = activeOpenEndedExam.questions[currentQuestionIndex];
        const userAnswer = openEndedUserAnswers[currentQuestionIndex];
        const feedback = openEndedFeedbacks[currentQuestionIndex];

        return (
            <div className="animate__animated animate__fadeIn max-w-3xl mx-auto space-y-6">
                <Card>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{activeOpenEndedExam.title} - {currentQuizTopic}</h2>
                            <p className="text-sm font-semibold text-gray-600">Câu hỏi {currentQuestionIndex + 1}/{activeOpenEndedExam.questions.length}</p>
                        </div>
                        <button onClick={resetState} className="text-sm text-red-500 hover:underline">Thoát</button>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <MarkdownRenderer content={question.question} />
                    </div>

                    {showCamera ? (
                        <div className="mt-4 flex flex-col items-center gap-4">
                            <div className="w-full relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-inner">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                            <div className="w-full flex gap-4">
                                <button onClick={() => setShowCamera(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Hủy</button>
                                <button onClick={handleCapture} className="flex-1 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-2"><CameraIcon className="w-5 h-5" /> Chụp</button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                             <textarea
                                value={userAnswer?.text || ''}
                                onChange={(e) => setOpenEndedUserAnswers(prev => ({...prev, [currentQuestionIndex]: { text: e.target.value, image: undefined }}))}
                                placeholder="Nhập câu trả lời của bạn vào đây..."
                                className="w-full h-32 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-cyan-300 focus:outline-none"
                                disabled={isLoading || !!feedback}
                            />
                             <div className="mt-2 flex items-center justify-between">
                                <button onClick={() => setShowCamera(true)}  disabled={isLoading || !!feedback} className="flex items-center gap-2 p-2 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 transition-colors">
                                    <CameraIcon className="w-5 h-5"/> Chụp ảnh bài làm
                                </button>
                                {userAnswer?.image && (
                                    <div className="flex items-center gap-2">
                                        <img src={userAnswer.image} alt="Bài làm" className="h-12 w-auto rounded border" />
                                        <button onClick={() => setOpenEndedUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], image: undefined }}))} className="text-red-500"><XIcon className="w-4 h-4" /></button>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                    
                    {capturedImageForAnswer && (
                        <div className="mt-2">
                            <p className="text-sm font-semibold mb-2">Ảnh đã chụp:</p>
                             <div className="flex items-center gap-2">
                                <img src={capturedImageForAnswer} alt="Bài làm đã chụp" className="h-20 w-auto rounded border shadow-sm" />
                                <button onClick={() => {
                                    setCapturedImageForAnswer(null);
                                    setOpenEndedUserAnswers(prev => ({...prev, [currentQuestionIndex]: { ...prev[currentQuestionIndex], image: undefined }}));
                                }} className="text-red-500 p-1 rounded-full hover:bg-red-50"><XIcon className="w-5 h-5" /></button>
                             </div>
                        </div>
                    )}

                    {!feedback && (
                         <button
                            onClick={handleGradeMockExamAnswer}
                            disabled={isLoading}
                            className="w-full mt-4 bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? 'Đang chấm điểm...' : 'Nộp bài và Chấm điểm'}
                        </button>
                    )}
                </Card>
                
                 {feedback && (
                    <Card className="animate__animated animate__fadeIn">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="text-cyan-500" /> Phản hồi từ Gia sư AI</h3>
                        <div className="text-center mb-6">
                            <p className="text-gray-600">Điểm của bạn</p>
                            <p className="text-6xl font-bold text-cyan-600">{feedback.score}<span className="text-2xl text-gray-400">/10</span></p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">💬 Nhận xét chung:</h4>
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{feedback.feedback}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <h4 className="font-semibold text-green-800 mb-1">👍 Điểm mạnh:</h4>
                                    <p className="text-green-700">{feedback.strengths}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <h4 className="font-semibold text-yellow-800 mb-1">🤔 Cần cải thiện:</h4>
                                    <ul className="list-disc list-inside text-yellow-700">
                                        {feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">💡 Gợi ý cải thiện:</h4>
                                 <div className="p-3 bg-blue-50 rounded-lg text-blue-700"><MarkdownRenderer content={feedback.suggestedImprovements} /></div>
                            </div>
                        </div>
                    </Card>
                )}
                
                <div className="flex justify-between items-center">
                    <button onClick={resetState} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-full hover:bg-gray-300">Kết thúc</button>
                    {currentQuestionIndex < activeOpenEndedExam.questions.length - 1 ? (
                        <button onClick={handleNextOpenEndedQuestion} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-full hover:bg-cyan-600">Câu tiếp theo &rarr;</button>
                    ) : (
                         <button onClick={resetState} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">Hoàn thành</button>
                    )}
                </div>
            </div>
        );
    }

    if (mode === 'quiz_open_ended') {
        const question = generatedOpenEndedQuestions[currentQuestionIndex];
        return (
            <div className="animate__animated animate__fadeIn max-w-2xl mx-auto">
                <Card>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-600">Câu hỏi Tự luận {currentQuestionIndex + 1}/{generatedOpenEndedQuestions.length}</p>
                        <button onClick={resetState} className="text-sm text-red-500 hover:underline">Thoát</button>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
                    </div>
                    <textarea
                        value={currentUserAnswer}
                        onChange={(e) => setCurrentUserAnswer(e.target.value)}
                        placeholder="Nhập câu trả lời của bạn vào đây..."
                        className="w-full h-48 mt-4 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-cyan-300 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGradeGeneratedAnswer}
                        disabled={isLoading}
                        className="w-full mt-4 bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? 'Đang chấm điểm...' : 'Nộp bài và xem kết quả'}
                    </button>
                </Card>
            </div>
        );
    }
    
    if (mode === 'results_open_ended') {
        const question = generatedOpenEndedQuestions[currentQuestionIndex];
        return (
            <div className="animate__animated animate__fadeIn max-w-3xl mx-auto space-y-6">
                 <Card>
                    <h3 className="text-xl font-bold mb-4">Câu hỏi {currentQuestionIndex + 1}: {question.topic}</h3>
                    <p className="p-4 bg-gray-100 rounded-lg">{question.question}</p>
                    <h4 className="font-bold mt-4 mb-2">Câu trả lời của bạn:</h4>
                    <p className="p-4 bg-blue-50 rounded-lg border border-blue-200 whitespace-pre-wrap">{currentUserAnswer}</p>
                </Card>

                {isLoading ? (
                    <Card><p>AI đang chấm điểm...</p></Card>
                ) : currentFeedback ? (
                    <>
                        <Card>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="text-cyan-500" /> Phản hồi từ Gia sư AI</h3>
                            <div className="text-center mb-6">
                                <p className="text-gray-600">Điểm của bạn</p>
                                <p className="text-6xl font-bold text-cyan-600">{currentFeedback.score}<span className="text-2xl text-gray-400">/10</span></p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">💬 Nhận xét chung:</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{currentFeedback.feedback}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-800 mb-1">👍 Điểm mạnh:</h4>
                                        <p className="text-green-700">{currentFeedback.strengths}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-1">🤔 Cần cải thiện:</h4>
                                        <ul className="list-disc list-inside text-yellow-700">
                                            {currentFeedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">💡 Gợi ý cải thiện:</h4>
                                     <div className="p-3 bg-blue-50 rounded-lg text-blue-700"><MarkdownRenderer content={currentFeedback.suggestedImprovements} /></div>
                                </div>
                            </div>
                        </Card>

                        {followUpExercises.length > 0 && (
                            <Card>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><LightbulbIcon className="text-purple-500" /> Bài tập củng cố kiến thức</h3>
                                <div className="space-y-4">
                                    {followUpExercises.map((ex, idx) => (
                                        <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="font-semibold text-purple-800">{idx + 1}. {ex.question}</p>
                                            <div className="text-sm mt-2 space-y-1 text-purple-700">
                                                {ex.options.map(opt => <p key={opt}>- {opt}</p>)}
                                            </div>
                                            <p className="text-sm mt-2 font-bold text-purple-900">Đáp án đúng: {ex.correctAnswer}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </>
                ) : null}

                <div className="flex justify-between items-center">
                    <button onClick={resetState} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-full hover:bg-gray-300">
                        Kết thúc
                    </button>
                    {currentQuestionIndex < generatedOpenEndedQuestions.length - 1 ? (
                        <button onClick={handleNextOpenEndedQuestion} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-full hover:bg-cyan-600">
                            Câu tiếp theo &rarr;
                        </button>
                    ) : (
                         <button onClick={resetState} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">
                            Hoàn thành
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (mode === 'generating_from_plan') return (
        <div className="flex flex-col items-center justify-center h-full animate__animated animate__fadeIn">
            <Card className="text-center">
                <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-cyan-500 animate-pulse" />
                <h3 className="text-2xl font-bold mb-2">Đang tạo bài tập...</h3>
                <p className="text-gray-600">Gia sư AI đang chuẩn bị một bài luyện tập phù hợp cho bạn. Vui lòng chờ trong giây lát.</p>
            </Card>
        </div>
    );

    if (mode === 'ready') return (
         <div className="flex flex-col items-center justify-center h-full animate__animated animate__fadeIn">
            <Card className="text-center">
                <CheckSquareIcon className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
                <h3 className="text-2xl font-bold mb-2">{currentQuizTitle}</h3>
                <p className="text-gray-600 mb-6">Sẵn sàng kiểm tra kiến thức của bạn với {currentQuestions.length} câu hỏi trắc nghiệm?</p>
                <div className="flex gap-4">
                    <button onClick={resetState} className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition-colors">
                        Chọn lại
                    </button>
                    <button onClick={() => setMode('quiz')} className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-full hover:bg-cyan-600 transition-transform hover:scale-105">
                        Bắt đầu
                    </button>
                </div>
            </Card>
        </div>
    );
    
    if (mode === 'quiz') {
        const question = currentQuestions[currentQuestionIndex];
        return (
            <div className="animate__animated animate__fadeIn">
                <Card>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500">Câu {currentQuestionIndex + 1} trên {currentQuestions.length}</p>
                        <button onClick={resetState} className="text-sm text-cyan-600 hover:underline">Thoát</button>
                    </div>
                    <h3 className="text-xl font-bold mb-6">{question.question}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map(option => (
                            <button key={option} onClick={() => handleAnswer(currentQuestionIndex, option)} className="p-4 border rounded-lg text-left hover:bg-cyan-100 hover:border-cyan-400 transition-colors">
                                {option}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }
    
    if (mode === 'results') return (
        <div className="animate__animated animate__fadeIn space-y-6">
            <Card className="text-center">
                <h3 className="text-2xl font-bold">{currentQuizTitle}</h3>
                <p className="text-5xl font-bold my-4 text-cyan-600">{Math.round((score / currentQuestions.length) * 100)}%</p>
                <p className="text-gray-600">Bạn đã trả lời đúng {score} trên {currentQuestions.length} câu.</p>
            </Card>

            <Card>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2"> <SparklesIcon className="w-5 h-5 text-yellow-500" /> Gợi ý từ AI</h4>
                {isLoading ? <p>Đang tạo gợi ý...</p> : <p className="text-gray-700 whitespace-pre-wrap">{recommendations}</p>}
            </Card>

            <Card>
                <h4 className="font-bold text-lg mb-4">Xem lại bài làm</h4>
                <QuizResultDetails questions={currentQuestions} answers={answers} explanations={explanations} />
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={resetState} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-300">
                    Chọn phần khác
                </button>
                <button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                    setExplanations({});
                    setMode('quiz');
                }} className="flex-1 bg-cyan-500 text-white font-bold py-3 px-6 rounded-full hover:bg-cyan-600">
                    Làm lại
                </button>
            </div>
            {openEndedForMixedQuiz.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <button
                        onClick={() => {
                            setGeneratedOpenEndedQuestions(openEndedForMixedQuiz);
                            setOpenEndedForMixedQuiz([]);
                            setCurrentQuestionIndex(0);
                            setGeneratedQuizSubject(currentQuizTopic);
                            setMode('quiz_open_ended');
                        }}
                        className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Tiếp tục với phần Tự luận <span aria-hidden="true">&rarr;</span>
                    </button>
                </div>
            )}
        </div>
    );
    
    return null; // Should not be reached
};