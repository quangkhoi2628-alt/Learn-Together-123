import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, Grade, Subject, PracticeQuestion, OpenEndedQuestion, OpenEndedFeedback, StudyDay, WeeklyPlan } from '../types';

const ai = new GoogleGenAI({ VITE_API_KEY: import.meta.env.API_KEY as string });

// Helper to handle API errors, especially for quota issues.
const handleGeminiError = (error: unknown, defaultMessage: string): string => {
  console.error("Gemini API Error:", error);
  if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
    return "Lỗi: Bạn đã vượt quá hạn ngạch sử dụng API. Vui lòng kiểm tra gói dịch vụ và thông tin thanh toán của bạn.";
  }
  return defaultMessage;
};

export const getStepByStepSolution = async (grade: number, subject: string, problem: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Hãy giải bài tập sau cho học sinh lớp ${grade} môn ${subject}, trình bày lời giải từng bước một cách rõ ràng: "${problem}"`,
      config: {
        systemInstruction: "Bạn là một gia sư AI chuyên nghiệp. Nhiệm vụ của bạn là cung cấp lời giải cho các bài tập. Hãy giải thích thật rõ ràng và dễ hiểu. Đối với các bài toán đơn giản, hãy đưa ra lời giải ngắn gọn. Đối với các bài toán phức tạp hơn, hãy trình bày chi tiết từng bước. LUÔN LUÔN tuân thủ các quy tắc định dạng sau: 1. Mỗi bước giải phải bắt đầu trên một dòng mới. 2. Các phép chia phải được viết dưới dạng phân số. 3. Hạn chế tối đa việc sử dụng các ký tự Markdown như # hoặc * để câu trả lời trông sạch sẽ, chuyên nghiệp. 4. Sử dụng cú pháp LaTeX cho tất cả các ký hiệu, công thức toán học và hóa học, bao quanh bằng dấu đô la (ví dụ: $x^2 + y^2 = z^2$ cho công thức inline và $$ \\Delta = b^2 - 4ac $$ cho công thức hiển thị riêng dòng). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.",
      }
    });
    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, mình đã gặp lỗi khi tạo lời giải. Vui lòng thử lại.");
  }
};

export const getSolutionFromImageForTutor = async (base64Image: string, mimeType: string, problemText: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: `Phân tích hình ảnh và giải bài tập trong đó. Nếu có văn bản đi kèm, hãy sử dụng nó làm ngữ cảnh bổ sung. Văn bản đi kèm: "${problemText}"`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        systemInstruction: "Bạn là một gia sư AI chuyên nghiệp. Nhiệm vụ của bạn là cung cấp lời giải cho các bài tập từ hình ảnh. Hãy giải thích thật rõ ràng và dễ hiểu từng bước một. LUÔN LUÔN tuân thủ các quy tắc định dạng sau: 1. Mỗi bước giải phải bắt đầu trên một dòng mới. 2. Các phép chia phải được viết dưới dạng phân số. 3. Hạn chế tối đa việc sử dụng các ký tự Markdown như # hoặc * để câu trả lời trông sạch sẽ, chuyên nghiệp. 4. Sử dụng cú pháp LaTeX cho tất cả các ký hiệu, công thức toán học và hóa học, bao quanh bằng dấu đô la (ví dụ: $x^2 + y^2 = z^2$ hoặc $H_2SO_4$). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.",
      }
    });

    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, mình đã gặp lỗi khi phân tích hình ảnh. Vui lòng thử lại với một ảnh rõ nét hơn.");
  }
};

export const getSolutionFromFileForTutor = async (base64File: string, mimeType: string, problemText: string): Promise<string> => {
  try {
    const filePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64File,
      },
    };
    const textPart = {
      text: `Phân tích tệp (có thể là PDF hoặc định dạng khác) và giải bài tập trong đó. Nếu có văn bản đi kèm, hãy sử dụng nó làm ngữ cảnh bổ sung. Văn bản đi kèm: "${problemText}"`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, filePart] },
      config: {
        systemInstruction: "Bạn là một gia sư AI chuyên nghiệp. Nhiệm vụ của bạn là cung cấp lời giải cho các bài tập từ tệp tài liệu. Hãy giải thích thật rõ ràng và dễ hiểu từng bước một. LUÔN LUÔN tuân thủ các quy tắc định dạng sau: 1. Mỗi bước giải phải bắt đầu trên một dòng mới. 2. Các phép chia phải được viết dưới dạng phân số. 3. Hạn chế tối đa việc sử dụng các ký tự Markdown như # hoặc * để câu trả lời trông sạch sẽ, chuyên nghiệp. 4. Sử dụng cú pháp LaTeX cho tất cả các ký hiệu, công thức toán học và hóa học, bao quanh bằng dấu đô la (ví dụ: $x^2 + y^2 = z^2$ hoặc $H_2SO_4$). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.",
      }
    });

    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, mình đã gặp lỗi khi phân tích tệp. Vui lòng thử lại với một tệp khác.");
  }
};

export const getQuickAnswer = async (grade: number, subject: string, problem: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Hãy giải nhanh và đưa ra đáp án trực tiếp cho bài tập sau đây dành cho học sinh lớp ${grade} môn ${subject}: "${problem}". Chỉ cần đưa ra đáp án cuối cùng một cách ngắn gọn. Sử dụng LaTeX cho các công thức toán học (ví dụ: $x=5$).`,
      config: {
        systemInstruction: "Bạn là một trợ lý AI, chuyên cung cấp đáp án nhanh và chính xác cho các bài tập học đường.",
      }
    });
    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, mình đã gặp lỗi khi tạo đáp án nhanh. Vui lòng thử lại.");
  }
};

export const generateFlashcards = async (text: string): Promise<Flashcard[] | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Tạo flashcard từ đoạn văn bản sau. Mỗi flashcard cần có một câu hỏi rõ ràng và câu trả lời ngắn gọn. Văn bản: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'Câu hỏi cho flashcard, tập trung vào một thuật ngữ hoặc khái niệm chính.',
              },
              answer: {
                type: Type.STRING,
                description: 'Câu trả lời ngắn gọn cho câu hỏi.',
              },
            },
            required: ["question", "answer"],
          },
        },
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return null;
  }
};

export const generateSummary = async (text: string): Promise<string | null> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bạn là một chuyên gia tóm tắt tài liệu học tập. Hãy đọc văn bản sau và tạo một bản tóm tắt có cấu trúc rõ ràng, đẹp mắt. Sử dụng Markdown để định dạng. Bản tóm tắt nên bao gồm:
- Một tiêu đề chính (ví dụ: # Tóm tắt chính).
- Các mục chính được phân chia bằng tiêu đề phụ (ví dụ: ## Phần 1: Khái niệm).
- Dưới mỗi mục, liệt kê các ý chính bằng gạch đầu dòng (sử dụng * hoặc -).
Giữ cho tóm tắt súc tích và dễ hiểu. Trả lời bằng tiếng Việt.
Văn bản: "${text}"`,
      config: {
        systemInstruction: "Bạn là một AI chuyên tạo ra các bản tóm tắt có cấu trúc tốt, được định dạng bằng Markdown sạch sẽ, phù hợp cho mục đích học tập."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
};


export const getPracticeRecommendations = async (weakTopics: string[]): Promise<string> => {
  if (weakTopics.length === 0) {
    return "Bạn đang làm rất tốt! Hãy tiếp tục cố gắng và luyện tập thêm bất kỳ chủ đề nào bạn muốn củng cố nhé.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Một học sinh đang gặp khó khăn với các chủ đề sau: ${weakTopics.join(', ')}. Hãy đề xuất 3 dạng bài tập hoặc khái niệm cụ thể mà học sinh nên tập trung để cải thiện. Hãy động viên và đưa ra lời khuyên hữu ích.`,
    });
    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Không thể tạo đề xuất. Vui lòng xem lại câu trả lời và thử lại.");
  }
};

export const generateStudyPlan = async (weakTopics: string[], subject: Subject): Promise<StudyDay[] | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bạn là một gia sư AI chuyên tạo lộ trình học tập cá nhân hóa. Một học sinh lớp 9 đang gặp khó khăn với các chủ đề sau trong môn ${subject}: ${weakTopics.join(', ')}.
      Hãy tạo một lộ trình học tập chi tiết cho 3 ngày để giúp học sinh cải thiện.
      Lộ trình phải được cấu trúc theo ngày (Ngày 1, Ngày 2, Ngày 3).
      Mỗi ngày bao gồm hai buổi: Sáng và Tối.
      Mỗi buổi học nên tập trung vào một môn học và một chủ đề cụ thể liên quan đến điểm yếu, với một hoạt động gợi ý (ví dụ: 'Ôn lại lý thuyết về [chủ đề]', 'Làm 5 bài tập trắc nghiệm về [chủ đề]', 'Xem video bài giảng về [chủ đề]').
      Gợi ý thời gian học cho mỗi buổi là 15-30 phút.
      Cung cấp kết quả dưới dạng JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER, description: "Số thứ tự ngày, ví dụ: 1" },
              morning: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "Môn học cho buổi sáng" },
                  topic: { type: Type.STRING, description: "Chủ đề cụ thể cần ôn tập" },
                  activity: { type: Type.STRING, description: "Hoạt động học tập được đề xuất" }
                },
                required: ["subject", "topic", "activity"]
              },
              evening: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "Môn học cho buổi tối" },
                  topic: { type: Type.STRING, description: "Chủ đề cụ thể cần ôn tập" },
                  activity: { type: Type.STRING, description: "Hoạt động học tập được đề xuất" }
                },
                required: ["subject", "topic", "activity"]
              }
            },
            required: ["day", "morning", "evening"]
          }
        },
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating study plan:", error);
    return null;
  }
};


export const analyzePdfContent = async (base64Pdf: string): Promise<string> => {
  try {
    const pdfPart = {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Pdf,
      },
    };
    const textPart = {
      text: "Phân tích tệp PDF này và cung cấp lời giải chi tiết, từng bước cho tất cả các bài tập có trong đó. LUÔN LUÔN tuân thủ các quy tắc định dạng sau: 1. Mỗi bước giải phải bắt đầu trên một dòng mới. 2. Hạn chế tối đa việc sử dụng các ký tự Markdown như # hoặc * để câu trả lời trông sạch sẽ, chuyên nghiệp. Thay vào đó, hãy trình bày các bài tập theo thứ tự (Bài 1, Bài 2,...) một cách tự nhiên. 3. Sử dụng cú pháp LaTeX cho tất cả các ký hiệu, công thức toán học và hóa học, bao quanh bằng dấu đô la (ví dụ: $x^2 + y^2 = z^2$). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, pdfPart] },
      config: {
        systemInstruction: "Bạn là một gia sư AI chuyên nghiệp, có khả năng phân tích tài liệu và giải bài tập một cách chính xác. Nhiệm vụ của bạn là cung cấp lời giải rõ ràng, từng bước, dễ hiểu cho học sinh.",
      }
    });

    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, đã có lỗi xảy ra khi phân tích tệp PDF. Vui lòng thử lại với một tệp khác hoặc kiểm tra xem tệp có bị hỏng không.");
  }
};

export const analyzeImageContent = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: "Phân tích hình ảnh này và cung cấp lời giải chi tiết, từng bước cho tất cả các bài tập có trong đó. LUÔN LUÔN tuân thủ các quy tắc định dạng sau: 1. Mỗi bước giải phải bắt đầu trên một dòng mới. 2. Hạn chế tối đa việc sử dụng các ký tự Markdown như # hoặc * để câu trả lời trông sạch sẽ, chuyên nghiệp. Thay vào đó, hãy trình bày các bài tập theo thứ tự (Bài 1, Bài 2,...) một cách tự nhiên. 3. Sử dụng cú pháp LaTeX cho tất cả các ký hiệu, công thức toán học và hóa học, bao quanh bằng dấu đô la (ví dụ: $x^2 + y^2 = z^2$). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        systemInstruction: "Bạn là một gia sư AI chuyên nghiệp, có khả năng phân tích hình ảnh chứa bài tập và giải chúng một cách chính xác. Nhiệm vụ của bạn là cung cấp lời giải rõ ràng, từng bước, dễ hiểu cho học sinh.",
      }
    });

    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, đã có lỗi xảy ra khi phân tích hình ảnh. Vui lòng thử lại với một ảnh khác hoặc kiểm tra xem ảnh có rõ nét không.");
  }
};

export const generatePracticeQuestionsFromPdf = async (base64Pdf: string, numQuestions: number): Promise<{ subject: Subject, questions: PracticeQuestion[] } | null> => {
  try {
    const pdfPart = {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Pdf,
      },
    };
    const textPart = {
      text: `Phân tích tệp PDF này. Dựa trên nội dung, hãy xác định môn học (ví dụ: Toán, Ngữ Văn, Tiếng Anh, Khoa học tự nhiên) và tạo ra một bài kiểm tra trắc nghiệm gồm ${numQuestions} câu.
      Mỗi câu hỏi phải có:
      1.  Một câu hỏi rõ ràng ('question'). Đối với câu hỏi toán học, sử dụng cú pháp LaTeX.
      2.  Bốn lựa chọn trả lời ('options'), trong đó chỉ có một lựa chọn đúng.
      3.  Đáp án chính xác ('correctAnswer'). Nếu câu hỏi trong PDF không có đáp án, bạn phải tự suy luận và cung cấp đáp án đúng.
      4.  Một chủ đề ngắn gọn liên quan đến câu hỏi ('topic').

      Trả về kết quả dưới dạng một đối tượng JSON duy nhất có chứa môn học ('subject') và một mảng các câu hỏi ('questions'). Môn học phải là một trong các giá trị sau: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".`,
    };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [textPart, pdfPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'Môn học của các câu hỏi. Phải là một trong: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".'
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer", "topic"],
              },
            }
          },
          required: ["subject", "questions"],
        },
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.questions) || typeof parsed.subject !== 'string') {
        throw new Error("Response is not in the expected format { subject: string, questions: array }");
    }
    
    const questionsWithSubject = parsed.questions.map((q: any) => ({ ...q, subject: parsed.subject as Subject, grade: 9 as Grade }));
    
    return {
        subject: parsed.subject as Subject,
        questions: questionsWithSubject
    };

  } catch (error) {
    console.error("Error generating practice questions from PDF:", error);
    return null;
  }
};

export const generatePracticeQuestionsFromImage = async (base64Image: string, mimeType: string, numQuestions: number): Promise<{ subject: Subject, questions: PracticeQuestion[] } | null> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: `Phân tích hình ảnh này. Dựa trên nội dung, hãy xác định môn học (ví dụ: Toán, Ngữ Văn, Tiếng Anh, Khoa học tự nhiên) và tạo ra một bài kiểm tra trắc nghiệm gồm ${numQuestions} câu.
      Mỗi câu hỏi phải có:
      1.  Một câu hỏi rõ ràng ('question'). Đối với câu hỏi toán học, sử dụng cú pháp LaTeX.
      2.  Bốn lựa chọn trả lời ('options'), trong đó chỉ có một lựa chọn đúng.
      3.  Đáp án chính xác ('correctAnswer'). Nếu câu hỏi trong ảnh không có đáp án, bạn phải tự suy luận và cung cấp đáp án đúng.
      4.  Một chủ đề ngắn gọn liên quan đến câu hỏi ('topic').

      Trả về kết quả dưới dạng một đối tượng JSON duy nhất có chứa môn học ('subject') và một mảng các câu hỏi ('questions'). Môn học phải là một trong các giá trị sau: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".`,
    };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'Môn học của các câu hỏi. Phải là một trong: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".'
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer", "topic"],
              },
            }
          },
          required: ["subject", "questions"],
        },
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.questions) || typeof parsed.subject !== 'string') {
        throw new Error("Response is not in the expected format { subject: string, questions: array }");
    }
    
    const questionsWithSubject = parsed.questions.map((q: any) => ({ ...q, subject: parsed.subject as Subject, grade: 9 as Grade }));
    
    return {
        subject: parsed.subject as Subject,
        questions: questionsWithSubject
    };

  } catch (error) {
    console.error("Error generating practice questions from image:", error);
    return null;
  }
};

export const generatePracticeQuestionsFromTopic = async (subject: Subject, topic: string, numQuestions: number): Promise<PracticeQuestion[] | null> => {
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Bạn là một AI chuyên tạo câu hỏi thi. Hãy tạo ${numQuestions} câu hỏi trắc nghiệm cho học sinh lớp 9 môn "${subject}" về chủ đề "${topic}".
          Mỗi câu hỏi phải có:
          1. Một câu hỏi rõ ràng ('question'). Đối với câu hỏi toán học, sử dụng cú pháp LaTeX.
          2. Bốn lựa chọn trả lời ('options').
          3. Đáp án chính xác ('correctAnswer').
          4. Chủ đề ('topic') phải là "${topic}".
          Trả về kết quả dưới dạng một mảng JSON.`,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          question: { type: Type.STRING },
                          options: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                          },
                          correctAnswer: { type: Type.STRING },
                          topic: { type: Type.STRING },
                      },
                      required: ["question", "options", "correctAnswer", "topic"],
                  },
              }
          }
      });

      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr);
      return parsed.map((q: any) => ({ ...q, subject, grade: 9 as Grade }));

  } catch (error) {
      console.error("Error generating practice questions from topic:", error);
      return null;
  }
};

export const generateOpenEndedQuestionsFromPdf = async (base64Pdf: string): Promise<{ subject: Subject, questions: OpenEndedQuestion[] } | null> => {
  try {
    const pdfPart = {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Pdf,
      },
    };
    const textPart = {
      text: `Phân tích tệp PDF này. Dựa trên nội dung, hãy xác định môn học và tạo ra các câu hỏi tự luận.
      Mỗi câu hỏi phải có:
      1.  Một câu hỏi rõ ràng ('question'). Đối với câu hỏi toán học, sử dụng cú pháp LaTeX.
      2.  Một câu trả lời hoặc gợi ý chi tiết ('suggestedAnswer'). Sử dụng LaTeX cho công thức toán học nếu có.
      3.  Một chủ đề ngắn gọn liên quan đến câu hỏi ('topic').

      Trả về kết quả dưới dạng một đối tượng JSON duy nhất có chứa môn học ('subject') và một mảng các câu hỏi ('questions'). Môn học phải là một trong các giá trị sau: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".`,
    };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [textPart, pdfPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'Môn học của các câu hỏi. Phải là một trong: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".'
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  suggestedAnswer: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ["question", "suggestedAnswer", "topic"],
              },
            }
          },
          required: ["subject", "questions"],
        },
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
     if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.questions) || typeof parsed.subject !== 'string') {
        throw new Error("Response is not in the expected format { subject: string, questions: array }");
    }
    
    return {
        subject: parsed.subject as Subject,
        questions: parsed.questions
    };

  } catch (error) {
    console.error("Error generating open-ended questions from PDF:", error);
    return null;
  }
};


export const generateOpenEndedQuestionsFromImage = async (base64Image: string, mimeType: string): Promise<{ subject: Subject, questions: OpenEndedQuestion[] } | null> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: `Phân tích hình ảnh này. Dựa trên nội dung, hãy xác định môn học và tạo ra các câu hỏi tự luận.
      Mỗi câu hỏi phải có:
      1.  Một câu hỏi rõ ràng ('question'). Đối với câu hỏi toán học, sử dụng cú pháp LaTeX.
      2.  Một câu trả lời hoặc gợi ý chi tiết ('suggestedAnswer'). Sử dụng LaTeX cho công thức toán học nếu có.
      3.  Một chủ đề ngắn gọn liên quan đến câu hỏi ('topic').

      Trả về kết quả dưới dạng một đối tượng JSON duy nhất có chứa môn học ('subject') và một mảng các câu hỏi ('questions'). Môn học phải là một trong các giá trị sau: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".`,
    };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'Môn học của các câu hỏi. Phải là một trong: "Toán", "Ngữ Văn", "Tiếng Anh", "Khoa học tự nhiên".'
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  suggestedAnswer: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ["question", "suggestedAnswer", "topic"],
              },
            }
          },
          required: ["subject", "questions"],
        },
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
     if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.questions) || typeof parsed.subject !== 'string') {
        throw new Error("Response is not in the expected format { subject: string, questions: array }");
    }
    
    return {
        subject: parsed.subject as Subject,
        questions: parsed.questions
    };

  } catch (error) {
    console.error("Error generating open-ended questions from Image:", error);
    return null;
  }
};


export const getExplanationForIncorrectAnswer = async (question: string, userAnswer: string, correctAnswer: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Một học sinh đã trả lời sai một câu hỏi trắc nghiệm.
      - Câu hỏi: "${question}"
      - Câu trả lời của học sinh: "${userAnswer}"
      - Đáp án đúng: "${correctAnswer}"

      Hãy giải thích một cách ngắn gọn, dễ hiểu tại sao câu trả lời của học sinh là sai và tại sao đáp án đúng lại là chính xác. Tập trung vào việc giúp học sinh hiểu được lỗi sai của mình. Sử dụng cú pháp LaTeX cho tất cả các ký hiệu, công thức toán học và hóa học, bao quanh bằng dấu đô la (ví dụ: $x^2 + y^2 = z^2$ cho công thức inline và $$ \\Delta = b^2 - 4ac $$ cho công thức hiển thị riêng dòng). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.`,
    });
    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, mình không thể tạo giải thích vào lúc này.");
  }
};

export const getFollowUpAnswer = async (problemContext: string, solutionContext: string, userQuestion: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Một học sinh đang xem lời giải cho một bài tập và có câu hỏi thêm. Hãy trả lời câu hỏi của học sinh dựa trên ngữ cảnh được cung cấp.
      
      **Bài tập gốc:** "${problemContext}"

      **Lời giải đã được cung cấp:**
      "${solutionContext}"

      **Câu hỏi của học sinh:** "${userQuestion}"

      Hãy giải đáp thắc mắc của học sinh một cách ngắn gọn, rõ ràng và tập trung vào câu hỏi. Sử dụng cú pháp LaTeX cho các công thức toán học.`,
      config: {
        systemInstruction: "Bạn là một gia sư AI thân thiện và kiên nhẫn. Nhiệm vụ của bạn là giải đáp các câu hỏi nối tiếp của học sinh về một bài tập cụ thể đã có lời giải.",
      }
    });
    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, mình đã gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại.");
  }
};

export const extractTextFromFile = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const filePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
    const textPart = {
      text: "Phân tích tệp được cung cấp và trích xuất tất cả nội dung văn bản từ đó. Chỉ trả về văn bản thô, không có bất kỳ định dạng, giải thích hoặc nhận xét bổ sung nào.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, filePart] },
       config: {
        systemInstruction: "Bạn là một công cụ OCR và trích xuất văn bản hiệu quả. Nhiệm vụ của bạn là đọc tệp và trả về chính xác văn bản chứa trong đó.",
      }
    });

    return response.text;
  } catch (error) {
    return handleGeminiError(error, "Rất tiếc, đã xảy ra lỗi khi trích xuất văn bản từ tệp. Vui lòng thử lại.");
  }
};

export const gradeOpenEndedAnswer = async (question: OpenEndedQuestion, userAnswer: string): Promise<OpenEndedFeedback | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Bạn là một giáo viên AI chuyên nghiệp và tận tâm. Một học sinh đã trả lời một câu hỏi tự luận. Nhiệm vụ của bạn là chấm điểm câu trả lời đó và đưa ra phản hồi mang tính xây dựng.

      **Câu hỏi:**
      ${question.question}

      **Đáp án gợi ý (để tham khảo):**
      ${question.suggestedAnswer}

      **Câu trả lời của học sinh:**
      ${userAnswer}

      Hãy đánh giá câu trả lời của học sinh dựa trên các tiêu chí: mức độ chính xác, sự đầy đủ, rõ ràng và logic.
      Trong các nhận xét của bạn, hãy sử dụng cú pháp LaTeX cho tất cả các ký hiệu và công thức toán học (ví dụ: $x^2 + y^2 = z^2$). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.
      Cung cấp phản hồi của bạn dưới dạng một đối tượng JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: 'Chấm điểm câu trả lời trên thang điểm 10.'
            },
            feedback: {
              type: Type.STRING,
              description: 'Nhận xét tổng quan, mang tính xây dựng về câu trả lời của học sinh.'
            },
            strengths: {
              type: Type.STRING,
              description: 'Chỉ ra những điểm học sinh đã làm tốt.'
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Liệt kê các điểm yếu hoặc thiếu sót cụ thể trong câu trả lời.'
            },
            suggestedImprovements: {
              type: Type.STRING,
              description: 'Đưa ra những gợi ý cụ thể để học sinh có thể cải thiện câu trả lời.'
            }
          },
          required: ["score", "feedback", "strengths", "weaknesses", "suggestedImprovements"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error grading open-ended answer:", error);
    return null;
  }
};

export const gradeOpenEndedAnswerFromImage = async (question: OpenEndedQuestion, base64Image: string, mimeType: string): Promise<OpenEndedFeedback | null> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: `Bạn là một giáo viên AI chuyên nghiệp và tận tâm. Một học sinh đã trả lời một câu hỏi tự luận bằng hình ảnh. Nhiệm vụ của bạn là phân tích hình ảnh, đọc câu trả lời của học sinh, sau đó chấm điểm và đưa ra phản hồi mang tính xây dựng.

      **Câu hỏi:**
      ${question.question}

      **Đáp án gợi ý (để tham khảo):**
      ${question.suggestedAnswer}

      **Câu trả lời của học sinh nằm trong hình ảnh.**

      Hãy đánh giá câu trả lời của học sinh dựa trên các tiêu chí: mức độ chính xác, sự đầy đủ, rõ ràng và logic.
      Trong các nhận xét của bạn, hãy sử dụng cú pháp LaTeX cho tất cả các ký hiệu và công thức toán học (ví dụ: $x^2 + y^2 = z^2$). KHÔNG BAO GIỜ thoát (escape) các dấu đô la. Ví dụ: viết là $x=1$, KHÔNG viết là \\$x=1\\$.
      Cung cấp phản hồi của bạn dưới dạng một đối tượng JSON.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: 'Chấm điểm câu trả lời trên thang điểm 10.'
            },
            feedback: {
              type: Type.STRING,
              description: 'Nhận xét tổng quan, mang tính xây dựng về câu trả lời của học sinh.'
            },
            strengths: {
              type: Type.STRING,
              description: 'Chỉ ra những điểm học sinh đã làm tốt.'
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Liệt kê các điểm yếu hoặc thiếu sót cụ thể trong câu trả lời.'
            },
            suggestedImprovements: {
              type: Type.STRING,
              description: 'Đưa ra những gợi ý cụ thể để học sinh có thể cải thiện câu trả lời.'
            }
          },
          required: ["score", "feedback", "strengths", "weaknesses", "suggestedImprovements"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error grading open-ended answer from image:", error);
    return null;
  }
};


export const generateFollowUpExercises = async (subject: Subject, topic: string, weaknesses: string[]): Promise<PracticeQuestion[] | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bạn là một gia sư AI thông minh. Một học sinh vừa trả lời một câu hỏi về chủ đề "${topic}" môn "${subject}" và đã bộc lộ những điểm yếu sau: ${weaknesses.join(', ')}.

      Hãy tạo ra 2 câu hỏi trắc nghiệm mới để giúp học sinh luyện tập và khắc phục những điểm yếu này. Các câu hỏi phải liên quan trực tiếp đến các điểm yếu đã nêu. Sử dụng cú pháp LaTeX cho các công thức toán học.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
                topic: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer", "topic"],
            }
        }
      }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.map((q: any) => ({ ...q, subject, grade: 9 as Grade }));

  } catch (error) {
    console.error("Error generating follow-up exercises:", error);
    return null;
  }
};

export const generateWeeklyStudyPlan = async (weakTopics: string[]): Promise<WeeklyPlan | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bạn là một gia sư AI chuyên tạo lộ trình học tập cá nhân hóa. Một học sinh lớp 9 đang có những điểm yếu ở các chủ đề sau: ${weakTopics.join(', ')}.
      Hãy tạo một lộ trình học tập cân bằng cho 7 ngày trong tuần, từ Thứ Hai đến Chủ Nhật.
      - Mỗi ngày bao gồm hai buổi: Sáng (morning) và Tối (evening).
      - Phân bổ các môn học chính (Toán, Ngữ Văn, Tiếng Anh, Khoa học tự nhiên) một cách hợp lý trong tuần.
      - Lồng ghép các buổi học tập trung vào các chủ đề yếu đã nêu ở trên.
      - Mỗi buổi học nên có một hoạt động gợi ý cụ thể (ví dụ: 'Ôn lại lý thuyết về...', 'Làm 5 bài tập trắc nghiệm về...', 'Viết một đoạn văn ngắn về...').
      - Một số buổi có thể để trống (null) để học sinh nghỉ ngơi.
      - Cung cấp kết quả dưới dạng một mảng JSON. Mỗi phần tử là một object cho một ngày.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dayOfWeek: { type: Type.STRING, description: "Thứ trong tuần, ví dụ: 'Thứ Hai'" },
              morning: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "Môn học cho buổi sáng" },
                  topic: { type: Type.STRING, description: "Chủ đề cụ thể cần ôn tập" },
                  activity: { type: Type.STRING, description: "Hoạt động học tập được đề xuất" }
                },
                nullable: true
              },
              evening: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "Môn học cho buổi tối" },
                  topic: { type: Type.STRING, description: "Chủ đề cụ thể cần ôn tập" },
                  activity: { type: Type.STRING, description: "Hoạt động học tập được đề xuất" }
                },
                nullable: true
              }
            },
            required: ["dayOfWeek", "morning", "evening"]
          }
        },
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating weekly study plan:", error);
    return null;
  }
};

export const updateWeeklyStudyPlan = async (currentPlan: WeeklyPlan, userRequest: string): Promise<{ updatedPlan: WeeklyPlan, responseText: string } | null> => {
  const studySessionSchema = {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      topic: { type: Type.STRING },
      activity: { type: Type.STRING }
    },
    required: ["subject", "topic", "activity"],
    nullable: true
  };

  const weeklyPlanSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        dayOfWeek: { type: Type.STRING },
        morning: studySessionSchema,
        evening: studySessionSchema
      },
      required: ["dayOfWeek", "morning", "evening"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bạn là một trợ lý lập kế hoạch học tập AI. Dưới đây là kế hoạch học tập hàng tuần hiện tại của học sinh (định dạng JSON):
      \`\`\`json
      ${JSON.stringify(currentPlan, null, 2)}
      \`\`\`
      Học sinh có yêu cầu sau: "${userRequest}"
      Nhiệm vụ của bạn là:
      1. Cập nhật kế hoạch học tập dựa trên yêu cầu của học sinh. Hãy linh hoạt và sáng tạo. Nếu học sinh yêu cầu thêm một buổi học, hãy cố gắng tìm một chỗ trống hoặc đề xuất thay thế một buổi khác ít quan trọng hơn. Nếu học sinh muốn xóa một buổi, hãy đặt giá trị của buổi đó thành null.
      2. Tạo một câu trả lời thân thiện, xác nhận thay đổi đã được thực hiện hoặc giải thích nếu không thể thực hiện được. Nếu bạn thêm một buổi học mới có hoạt động liên quan đến 'bài tập', hãy khuyến khích học sinh nhấn vào nút "Bắt đầu luyện tập" trên buổi học đó để làm một bài kiểm tra ngắn.
      3. Trả về kết quả dưới dạng một đối tượng JSON duy nhất.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedPlan: weeklyPlanSchema,
            responseText: {
              type: Type.STRING,
              description: "Câu trả lời trò chuyện thân thiện giải thích những thay đổi đã thực hiện."
            }
          },
          required: ["updatedPlan", "responseText"]
        },
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error updating weekly study plan:", error);
    return null;
  }
};

export const generateMixedPracticeTest = async (subject: Subject, topic: string, numMcq: number, numOpenEnded: number): Promise<{ mcq: PracticeQuestion[], openEnded: OpenEndedQuestion[] } | null> => {
  const isEnglish = subject === 'Tiếng Anh';
  const prompt = isEnglish
    ? `You are an expert AI for creating English language practice tests for grade 9 students in Vietnam.
      Generate a mixed practice test about the topic "${topic}".
      The test must be entirely in English.
      It should contain at least ${numMcq} multiple-choice questions (MCQs) and at least ${numOpenEnded} open-ended questions.
      For each MCQ, provide: 'question', four 'options', and the 'correctAnswer'. Also add a 'topic' field with the value "${topic}".
      For each open-ended question, provide: 'question', a 'suggestedAnswer', and a 'topic' field with the value "${topic}".
      Return the result as a single JSON object with two keys: "mcq" and "openEnded".`
    : `Bạn là một AI chuyên tạo đề kiểm tra cho học sinh lớp 9.
      Hãy tạo một bài kiểm tra hỗn hợp về chủ đề "${topic}" cho môn "${subject}".
      Bài kiểm tra phải bao gồm ít nhất ${numMcq} câu hỏi trắc nghiệm và ít nhất ${numOpenEnded} câu hỏi tự luận.
      Với mỗi câu hỏi trắc nghiệm, hãy cung cấp: 'question' (câu hỏi), bốn 'options' (lựa chọn), 'correctAnswer' (đáp án đúng), và trường 'topic' với giá trị là "${topic}". Sử dụng cú pháp LaTeX cho các công thức toán học.
      Với mỗi câu hỏi tự luận, hãy cung cấp: 'question' (câu hỏi), 'suggestedAnswer' (gợi ý trả lời), và trường 'topic' với giá trị là "${topic}". Sử dụng cú pháp LaTeX cho các công thức toán học.
      Trả về kết quả dưới dạng một đối tượng JSON duy nhất có hai khóa: "mcq" và "openEnded".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer", "topic"],
              },
            },
            openEnded: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  suggestedAnswer: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ["question", "suggestedAnswer", "topic"],
              },
            },
          },
          required: ["mcq", "openEnded"],
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);

    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.mcq) || !Array.isArray(parsed.openEnded)) {
        throw new Error("Response is not in the expected format { mcq: array, openEnded: array }");
    }

    const mcqWithDefaults = parsed.mcq.map((q: any) => ({ ...q, subject, grade: 9 as Grade }));

    return {
        mcq: mcqWithDefaults,
        openEnded: parsed.openEnded,
    };

  } catch (error) {
    console.error("Error generating mixed practice test:", error);
    return null;
  }
};
