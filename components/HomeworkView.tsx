import React, { useState, useEffect, useRef } from 'react';
import { SolutionHistoryItem } from '../types';
import { analyzePdfContent, analyzeImageContent, getFollowUpAnswer } from '../services/geminiService';
import { Card } from './Card';
import { SparklesIcon, UploadCloudIcon, CameraIcon, ClipboardIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';


const HomeworkView: React.FC<{ 
    onAddSolutionHistory: (item: SolutionHistoryItem) => void;
}> = ({ onAddSolutionHistory }) => {
    // View mode and file states
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfSolution, setPdfSolution] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageSolution, setImageSolution] = useState<string>('');
    const [showCamera, setShowCamera] = useState(false);
    
    // General states
    const [isLoading, setIsLoading] = useState(false);
    const [currentMode, setCurrentMode] = useState<'pdf' | 'image' | null>(null);

    // Camera refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    useEffect(() => {
        const startCamera = async () => {
            if (showCamera) {
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

        return () => stopCamera();
    }, [showCamera]);


    // PDF mode handlers
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const maxSize = 15 * 1024 * 1024; // 15MB
            if (file.size > maxSize) {
                alert(`Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 15MB.`);
                event.target.value = '';
                return;
            }
            if (file.type === "application/pdf") {
                setPdfFile(file);
                setPdfSolution(''); // Clear previous solution
            } else {
                alert("Vui lòng chỉ tải lên tệp PDF.");
            }
        }
        event.target.value = '';
    };

    const handleAnalyzePdf = async () => {
        if (!pdfFile) return alert("Vui lòng chọn một tệp PDF trước.");

        setIsLoading(true);
        setCurrentMode('pdf');
        setPdfSolution('');

        const reader = new FileReader();
        reader.readAsDataURL(pdfFile);
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const result = await analyzePdfContent(base64String);
            setPdfSolution(result);
            if (result && !result.toLowerCase().includes('lỗi')) {
                onAddSolutionHistory({
                    type: 'solution-pdf',
                    fileName: pdfFile.name,
                    timestamp: Date.now()
                });
            }
            setIsLoading(false);
        };
        reader.onerror = () => {
            console.error("Error reading file");
            setPdfSolution("Đã xảy ra lỗi khi đọc tệp. Vui lòng thử lại.");
            setIsLoading(false);
        };
    };

    // Image mode handlers
    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const maxSize = 15 * 1024 * 1024; // 15MB
            if (file.size > maxSize) {
                alert(`Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 15MB.`);
                event.target.value = '';
                return;
            }
            setImageFile(file);
            setImageSolution('');
            setImagePreview(URL.createObjectURL(file));
        }
        event.target.value = '';
    };

    const handleAnalyzeImage = async () => {
        if (!imageFile) return alert("Vui lòng chọn một tệp ảnh trước.");
        setIsLoading(true);
        setCurrentMode('image');
        setImageSolution('');
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const result = await analyzeImageContent(base64String, imageFile.type);
            setImageSolution(result);
            if (result && !result.toLowerCase().includes('lỗi')) {
                onAddSolutionHistory({
                    type: 'solution-image',
                    fileName: imageFile.name,
                    timestamp: Date.now()
                });
            }
            setIsLoading(false);
        };
        reader.onerror = () => {
            console.error("Error reading file");
            setImageSolution("Đã xảy ra lỗi khi đọc tệp ảnh. Vui lòng thử lại.");
            setIsLoading(false);
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
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setImagePreview(dataUrl);
                setShowCamera(false); // Hide camera view after capture
            }
        }
    };
    
    const handleAnalyzeCapturedImage = async () => {
        if (!imagePreview) return alert("Vui lòng chụp ảnh trước.");
        setIsLoading(true);
        setCurrentMode('image');
        setImageSolution('');
        try {
            const base64String = imagePreview.split(',')[1];
            const mimeType = imagePreview.match(/:(.*?);/)?.[1] || 'image/jpeg';
            const result = await analyzeImageContent(base64String, mimeType);
            setImageSolution(result);
            if (result && !result.toLowerCase().includes('lỗi')) {
                onAddSolutionHistory({
                    type: 'solution-image',
                    fileName: `Ảnh chụp lúc ${new Date().toLocaleTimeString('vi-VN')}`,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error("Error analyzing captured image:", error);
            setImageSolution("Đã xảy ra lỗi khi phân tích ảnh chụp. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetImageMode = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageSolution('');
        setShowCamera(false);
        if (currentMode === 'image') setCurrentMode(null);
    }
    
    const resetPdfMode = () => {
        setPdfFile(null);
        setPdfSolution('');
        if (currentMode === 'pdf') setCurrentMode(null);
    }

    const solutionText = currentMode === 'pdf' ? pdfSolution : imageSolution;

    return (
        <div className="space-y-6 animate__animated animate__fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold mb-4">Giải bài tập từ File PDF</h3>
                    <div className="flex flex-col items-center gap-4">
                        <label htmlFor="pdf-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-gray-600 font-semibold text-center">
                                {pdfFile ? pdfFile.name : 'Nhấn để chọn tệp PDF'}
                            </span>
                            <p className="text-xs text-gray-500">Tối đa 15MB</p>
                            <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                        <button
                            onClick={handleAnalyzePdf}
                            disabled={!pdfFile || (isLoading && currentMode !== 'pdf')}
                            className="w-full bg-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading && currentMode === 'pdf' ? 'Đang phân tích...' : 'Phân tích & Giải'}
                        </button>
                    </div>
                </Card>
                 <Card>
                    <h3 className="text-xl font-bold mb-4">Giải bài tập qua Ảnh</h3>
                     {showCamera ? (
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-full relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-inner">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                            <div className="w-full flex gap-4">
                                <button onClick={() => setShowCamera(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                    Hủy
                                </button>
                                <button onClick={handleCapture} className="flex-1 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
                                    <CameraIcon className="w-5 h-5" />
                                    Chụp ảnh
                                </button>
                            </div>
                        </div>
                     ) : imagePreview ? (
                        <div className="flex flex-col items-center gap-4">
                            <p className="font-semibold">Xem trước ảnh:</p>
                            <img src={imagePreview} alt="Xem trước bài tập" className="max-h-60 rounded-lg border shadow-sm" />
                            <div className="w-full flex gap-4">
                                <button onClick={resetImageMode} className="flex-1 bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                                    Chọn ảnh khác
                                </button>
                                <button
                                    onClick={imageFile ? handleAnalyzeImage : handleAnalyzeCapturedImage}
                                    disabled={isLoading && currentMode !== 'image'}
                                    className="flex-1 bg-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    {isLoading && currentMode === 'image' ? 'Đang phân tích...' : 'Phân tích & Giải'}
                                </button>
                            </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center gap-4">
                            <label htmlFor="image-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-gray-600 font-semibold text-center">
                                    Nhấn để tải ảnh lên
                                </span>
                                <p className="text-xs text-gray-500">PNG, JPG, v.v. (Tối đa 15MB)</p>
                                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} />
                            </label>
                            <div className="flex items-center w-full">
                                <hr className="flex-grow border-t border-gray-300" />
                                <span className="px-4 text-gray-500">hoặc</span>
                                <hr className="flex-grow border-t border-gray-300" />
                            </div>
                            <button
                                onClick={() => setShowCamera(true)}
                                className="w-full bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 transition-colors"
                            >
                                <CameraIcon className="w-5 h-5" />
                                Sử dụng camera
                            </button>
                        </div>
                     )}
                </Card>
            </div>
            {(pdfSolution || imageSolution) && (
                <Card>
                    <div className="flex justify-between items-start mb-4">
                         <h4 className="font-bold text-lg">
                            Lời giải từ {currentMode === 'pdf' ? `file: ${pdfFile?.name}` : `ảnh: ${imageFile?.name || 'Ảnh đã chụp'}`}
                         </h4>
                    </div>
                    
                    <div className="p-4 bg-cyan-50/50 rounded-lg min-h-[200px] border border-cyan-100">
                        {isLoading ? (
                             <div className="space-y-4 animate-pulse p-2">
                                <div className="h-4 bg-cyan-200/50 rounded w-3/4"></div>
                                <div className="h-4 bg-cyan-200/50 rounded w-full"></div>
                                <div className="h-4 bg-cyan-200/50 rounded w-full"></div>
                                <div className="h-4 bg-cyan-200/50 rounded w-1/2"></div>
                            </div>
                        ) : (
                            solutionText.trim() 
                                ? <MarkdownRenderer content={solutionText} /> 
                                : <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                                    <SparklesIcon className="w-12 h-12 text-gray-300 mb-4" />
                                    <span>Vui lòng tải tệp lên và nhấn Phân tích.</span>
                                  </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}

export { HomeworkView };
