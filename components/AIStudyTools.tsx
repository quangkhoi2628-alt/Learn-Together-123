import React, { useState, useEffect, useRef } from 'react';
import { AIToolHistoryItem, Flashcard } from '../types';
import { generateFlashcards, generateSummary, extractTextFromFile } from '../services/geminiService';
import { Card } from './Card';
import { SparklesIcon, UploadCloudIcon, CameraIcon, ClipboardIcon, FileTextIcon, BookOpenIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';


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
        setIsLoading(prev => ({ ...prev, flashcards: false }));

        if (cards !== null) {
            setFlashcards(cards);
            if (cards.length > 0) {
                onAddAIToolHistory({
                    type: 'flashcards',
                    sourceTextSnippet: textInput.substring(0, 40) + (textInput.length > 40 ? '...' : ''),
                    timestamp: Date.now()
                });
            } else {
                alert("Không thể tạo flashcard từ văn bản được cung cấp. Hãy thử với một đoạn văn bản khác chi tiết hơn.");
            }
        } else {
            alert("Rất tiếc, đã có lỗi xảy ra khi tạo flashcard. Vui lòng thử lại.");
        }
    };

    const handleGenerateSummary = async () => {
        if (!textInput.trim()) return;
        setIsLoading(prev => ({ ...prev, summary: true }));
        setFlashcards([]);
        setSummary('');
        const result = await generateSummary(textInput);
        setIsLoading(prev => ({ ...prev, summary: false }));

        if (result !== null) {
            setSummary(result);
            onAddAIToolHistory({
                type: 'summary',
                sourceTextSnippet: textInput.substring(0, 40) + (textInput.length > 40 ? '...' : ''),
                timestamp: Date.now()
            });
        } else {
            alert("Rất tiếc, đã có lỗi xảy ra khi tạo tóm tắt. Vui lòng thử lại.");
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

export default AIStudyTools;