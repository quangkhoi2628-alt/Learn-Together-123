import React, { useState, useRef, useEffect } from 'react';
import { getStepByStepSolution, getSolutionFromImageForTutor, getSolutionFromFileForTutor } from '../services/geminiService';
import { AITutorSession, AITutorMessage } from '../types';
import { TeacherCharacter } from './TeacherCharacter';
import { PlusIcon, SparklesIcon, Trash2Icon, MenuIcon, XIcon, PaperclipIcon, SendIcon, CameraIcon, FileTextIcon } from './Icons';

interface AITutorProps {
    sessions: AITutorSession[];
    activeSession: AITutorSession | undefined;
    onSelectSession: (id: string) => void;
    onNewSession: () => void;
    onUpdateSessionMessages: (sessionId: string, messages: AITutorMessage[]) => void;
    onDeleteSession: (id: string) => void;
}

const CameraModal: React.FC<{ onCapture: (dataUrl: string) => void; onClose: () => void }> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

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
                onClose();
            }
        };
        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
        startCamera();
        return () => stopCamera();
    }, [onClose]);

    const handleCaptureClick = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onCapture(dataUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 max-w-lg w-full animate__animated animate__fadeInUp animate__faster">
                <h3 className="text-lg font-bold mb-2">Chụp ảnh bài tập</h3>
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-gray-900 aspect-video object-cover"></video>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button onClick={handleCaptureClick} className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                        <CameraIcon className="w-5 h-5" /> Chụp
                    </button>
                </div>
            </div>
        </div>
    );
}

function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


export const AITutor: React.FC<AITutorProps> = ({ sessions, activeSession, onSelectSession, onNewSession, onUpdateSessionMessages, onDeleteSession }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; dataUrl: string; isImage: boolean } | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [activeSession?.messages]);
  
  const handleCapture = (dataUrl: string) => {
    const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
    setSelectedFile({ file, dataUrl, isImage: true });
    setShowCameraModal(false);
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        alert("Tệp ảnh quá lớn. Vui lòng chọn tệp nhỏ hơn 15MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const isImage = file.type.startsWith('image/');
        setSelectedFile({ file, dataUrl: reader.result as string, isImage });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow selecting the same file again
    e.target.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !activeSession || (!input.trim() && !selectedFile)) return;
    
    let userMessageText = input;
    if (selectedFile && !selectedFile.isImage) {
        const fileInfo = `(Tệp đính kèm: ${selectedFile.file.name})`;
        userMessageText = input ? `${input}\n\n${fileInfo}` : fileInfo;
    }

    const userMessage: AITutorMessage = {
      role: 'user',
      text: userMessageText,
      imageUrl: selectedFile?.isImage ? selectedFile.dataUrl : undefined,
    };
    
    const newMessages = [...activeSession.messages, userMessage];
    onUpdateSessionMessages(activeSession.id, newMessages);
    
    const fileToProcess = selectedFile;
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    let responseText = '';
    
    if (fileToProcess) {
      const base64String = fileToProcess.dataUrl.split(',')[1];
      if (fileToProcess.isImage) {
        responseText = await getSolutionFromImageForTutor(base64String, fileToProcess.file.type, input);
      } else {
        responseText = await getSolutionFromFileForTutor(base64String, fileToProcess.file.type, input);
      }
    } else {
      const currentGrade = 9;
      const currentSubject = 'Toán'; // Default to Math for text-only
      responseText = await getStepByStepSolution(currentGrade, currentSubject, input);
    }
    
    const modelMessage: AITutorMessage = { role: 'model', text: responseText };
    onUpdateSessionMessages(activeSession.id, [...newMessages, modelMessage]);
    setIsLoading(false);
  };
  
  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xoá cuộc trò chuyện này không?")) {
        onDeleteSession(sessionId);
    }
  }

  const handleSelectAndClose = (sessionId: string) => {
    onSelectSession(sessionId);
    setIsHistoryOpen(false);
  };

  const handleNewAndClose = () => {
    onNewSession();
    setIsHistoryOpen(false);
  };


  return (
    <div className="h-full relative">
        {showCameraModal && <CameraModal onCapture={handleCapture} onClose={() => setShowCameraModal(false)} />}
        {/* Backdrop for history panel */}
        {isHistoryOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity lg:hidden"
                onClick={() => setIsHistoryOpen(false)}
            />
        )}
        
        {/* History Panel (Slide-out) */}
        <div className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white p-4 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center pb-2 mb-2 border-b-2 border-gray-100">
                <h3 className="font-bold text-gray-700">Lịch sử trò chuyện</h3>
                 <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <button onClick={handleNewAndClose} className="w-full flex items-center justify-center gap-2 mb-2 p-2 rounded-lg text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors font-semibold" title="Trò chuyện mới">
                <PlusIcon className="w-5 h-5" />
                Trò chuyện mới
            </button>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
                {sessions.sort((a,b) => b.timestamp - a.timestamp).map(session => (
                <div 
                    key={session.id} 
                    onClick={() => handleSelectAndClose(session.id)} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${session.id === activeSession?.id ? 'bg-cyan-100 text-cyan-800 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                    <p className="flex-1 truncate text-sm">{session.title}</p>
                    <button onClick={(e) => handleDelete(e, session.id)} className="ml-2 p-1 rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" title="Xoá cuộc trò chuyện">
                    <Trash2Icon className="w-4 h-4" />
                    </button>
                </div>
                ))}
            </div>
        </div>


      {/* Chat Panel */}
      <div className="h-full w-full bg-cyan-50 rounded-2xl p-4 shadow-inner flex flex-col">
        <div className="flex justify-between items-center gap-2 pb-2 mb-2 border-b-2 border-cyan-200/60">
            <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-cyan-500"/>
                <h3 className="text-lg font-bold text-gray-700">Gia Sư AI</h3>
            </div>
             <button onClick={() => setIsHistoryOpen(true)} className="p-2 rounded-full text-gray-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors">
                <MenuIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
            {!activeSession ? (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    Bắt đầu một cuộc trò chuyện mới!
                </div>
            ) : (
                <div className="space-y-4">
                    {activeSession.messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 animate__animated animate__fadeInUp animate__faster ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <TeacherCharacter className="w-12 h-16 flex-shrink-0" />}
                        <div className={`max-w-md lg:max-w-lg p-4 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-md'}`}>
                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="User submission" className="mb-2 rounded-lg max-w-xs cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')} />
                            )}
                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                        </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-3 animate__animated animate__fadeInUp animate__faster">
                        <TeacherCharacter className="w-12 h-16 flex-shrink-0" isAnimating={true} />
                        <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Gia sư đang gõ</span>
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            </div>
                        </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
        <div className="mt-4">
            {selectedFile && (
                <div className="p-2 bg-white rounded-lg shadow-sm relative w-fit mb-2">
                    {selectedFile.isImage ? (
                         <img src={selectedFile.dataUrl} alt="Preview" className="max-h-24 rounded" />
                    ) : (
                        <div className="flex items-center gap-2 p-2">
                            <FileTextIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">{selectedFile.file.name}</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setSelectedFile(null)} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 flex items-center justify-center hover:bg-red-600"
                        aria-label="Remove file"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            <form onSubmit={handleSendMessage}>
                <div className="relative">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf" className="hidden" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!activeSession ? "Tạo cuộc trò chuyện mới để bắt đầu" : "Hỏi bài tập hoặc đính kèm ảnh/tệp..."}
                        className="w-full pl-4 pr-32 py-3 rounded-full border-2 border-transparent bg-white focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition duration-300 shadow-sm"
                        disabled={isLoading || !activeSession}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => setShowCameraModal(true)}
                            disabled={isLoading || !activeSession}
                            className="p-2 rounded-full text-gray-500 hover:bg-cyan-100 hover:text-cyan-600 disabled:opacity-50 transition-colors"
                            aria-label="Chụp ảnh bài tập"
                        >
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || !activeSession}
                            className="p-2 rounded-full text-gray-500 hover:bg-cyan-100 hover:text-cyan-600 disabled:opacity-50 transition-colors"
                            aria-label="Đính kèm tệp"
                        >
                            <PaperclipIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (!input.trim() && !selectedFile) || !activeSession}
                            className="p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-gray-300 transition-colors duration-300"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
