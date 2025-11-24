import { AnyMockExam } from '../types';

export const MOCK_EXAMS_ENGLISH_GRADE_9_MIDTERM_1: AnyMockExam[] = [
    {
        id: 'ta9-gk1-de1-mcq',
        title: 'Đề 1 (Global Success) - Trắc nghiệm & Đọc hiểu',
        source: 'Đề thi giữa học kì 1 - Global Success',
        questions: [
            // Part 2: Language
            { subject: "Tiếng Anh", topic: "Phát âm", question: "Mark the letter A, B, C or D to indicate the word whose underlined part is pronounced differently from the others: **pottery**", options: ["p**o**ttery", "c**o**ntrol", "f**o**ld", "l**o**cal"], correctAnswer: "p**o**ttery", grade: 9 },
            { subject: "Tiếng Anh", topic: "Phát âm", question: "Mark the letter A, B, C or D to indicate the word whose underlined part is pronounced differently from the others: **handicrafts**", options: ["handicraft**s**", "collection**s**", "artisan**s**", "skill**s**"], correctAnswer: "handicraft**s**", grade: 9 },
            { subject: "Tiếng Anh", topic: "Trọng âm", question: "Mark the letter A, B, C or D to indicate the word that differs from the other three in the position of primary stress: **suburb**", options: ["suburb", "delight", "helpline", "workshop"], correctAnswer: "delight", grade: 9 },
            { subject: "Tiếng Anh", topic: "Trọng âm", question: "Mark the letter A, B, C or D to indicate the word that differs from the other three in the position of primary stress: **handicraft**", options: ["handicraft", "collector", "department", "opinion"], correctAnswer: "handicraft", grade: 9 },
            { subject: "Tiếng Anh", topic: "Từ vựng", question: "This vase is a beautiful piece of _______. It's made of clay dug from our river banks.", options: ["pottery", "drum", "basket", "painting"], correctAnswer: "pottery", grade: 9 },
            { subject: "Tiếng Anh", topic: "Từ vựng", question: "_______ demonstrate exceptional skills and dedication in their craft.", options: ["Police officers", "Electricians", "Workers", "Artisans"], correctAnswer: "Artisans", grade: 9 },
            { subject: "Tiếng Anh", topic: "Từ vựng", question: "The bustling _______ of the city offers opportunities for entertainment and employment.", options: ["infrastructure", "neighbourhood", "systems", "lifestyles"], correctAnswer: "lifestyles", grade: 9 },
            { subject: "Tiếng Anh", topic: "Từ vựng", question: "The downtown area is _______ with restaurants, shops, and entertainment venues.", options: ["peaceful", "bustling", "empty", "silent"], correctAnswer: "bustling", grade: 9 },
            { subject: "Tiếng Anh", topic: "Ngữ pháp", question: "If there's a deadline approaching, students _______ manage their time wisely.", options: ["need to", "can", "must", "will"], correctAnswer: "must", grade: 9 },
            { subject: "Tiếng Anh", topic: "Ngữ pháp", question: "Do you know _______ to find artisans to learn how to make handmade textiles?", options: ["when", "where", "what", "who"], correctAnswer: "where", grade: 9 },
            { subject: "Tiếng Anh", topic: "Cụm động từ", question: "We are _______ a project on teen pressure at the moment.", options: ["carrying out", "taking up", "cutting down on", "getting around"], correctAnswer: "carrying out", grade: 9 },
            { subject: "Tiếng Anh", topic: "Cụm động từ", question: "Conical hat making in the village has been passed _______ from generation to generation.", options: ["up", "on", "down", "in"], correctAnswer: "down", grade: 9 },
            { subject: "Tiếng Anh", topic: "Ngữ pháp", question: "Many tourists wonder _______ specialty food in the Old Quarters in Ha Noi.", options: ["where eating", "where did they eat", "can they eat", "where to eat"], correctAnswer: "where to eat", grade: 9 },
            { subject: "Tiếng Anh", topic: "Giao tiếp", question: "Joan: Do you need help with carrying those groceries? - Tom: _______", options: ["Never mind. Let's get it done together.", "Thanks! That would be great. I appreciate it.", "Sure, I'd be happy to help.", "Of course not. I'd be happy to help you with that."], correctAnswer: "Thanks! That would be great. I appreciate it.", grade: 9 },
            { subject: "Tiếng Anh", topic: "Giao tiếp", question: "Julie: Thank you for showing me around Van Phuc Silk Village. - Lan: _______", options: ["My pleasure.", "Yes, you should say so.", "You're alright.", "That would be great."], correctAnswer: "My pleasure.", grade: 9 },
            // Part 3: Reading
            { subject: "Tiếng Anh", topic: "Đọc điền từ", question: "Few people go outside the city, and so they miss out on (26) _______ the scenery and the fascinating history of this beautiful area.", options: ["questioning", "experiencing", "understanding", "welcoming"], correctAnswer: "experiencing", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc điền từ", question: "The beautiful village of Tatterbridge was (27) _______ to the children's writer Jane Potter...", options: ["shop", "school", "home", "cottage"], correctAnswer: "home", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc điền từ", question: "Jane Potter's home is now a museum and teashop, and is well (28) _______ a visit just for its wonderful gardens.", options: ["known", "worth", "value", "excited"], correctAnswer: "known", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc điền từ", question: "...you can find lots of unusual gifts made (29) _______ hand by local artists.", options: ["at", "with", "in", "by"], correctAnswer: "by", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc điền từ", question: "...which have not changed since Jane Potter (30) _______ her stories there one hundred years ago.", options: ["wrote", "designed", "carved", "weaved"], correctAnswer: "wrote", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc hiểu", question: "What is the role of sleep for teens?", options: ["It strengthens muscles.", "It reduces cravings for unhealthy foods.", "It helps with muscle growth.", "It improves academic performance."], correctAnswer: "It improves academic performance.", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc hiểu", question: "How many hours of sleep do teens require per night?", options: ["6-8 hours.", "4-6 hours.", "8-10 hours.", "10-12 hours."], correctAnswer: "8-10 hours.", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc hiểu", question: "What reasons for the shortage of sleep in teens are NOT mentioned?", options: ["Caffeine overconsumption.", "Extracurricular activities.", "Excitement after doing sports.", "Overuse of electronic devices."], correctAnswer: "Caffeine overconsumption.", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc hiểu", question: "What does 'It' in the second paragraph refer to? (The sentence is 'It can also weaken the immune system...')", options: ["Lack of sleep", "The benefit of sleep.", "Caffeine overconsumption", "The immune system"], correctAnswer: "Lack of sleep", grade: 9 },
            { subject: "Tiếng Anh", topic: "Đọc hiểu", question: "What are teens necessary to do to sleep well at night?", options: ["Drink coffee before going to bed.", "Use smartphones a lot before going to bed.", "Make a sleep environment friendly.", "Go to bed at different time."], correctAnswer: "Make a sleep environment friendly.", grade: 9 }
        ]
    },
    {
        id: 'ta9-gk1-de1-oe',
        title: 'Đề 1 (Global Success) - Viết',
        source: 'Đề thi giữa học kì 1 - Global Success',
        type: 'open-ended',
        questions: [
            { topic: "Viết lại câu", question: "Rewrite the sentence using the given words, add NO MORE THAN FIVE WORDS if necessary: 'busier / my schedule / get, / harder / it / become / find time / relaxation.'", suggestedAnswer: "The busier my schedule gets, the harder it becomes to find time for relaxation." },
            { topic: "Viết lại câu", question: "Rewrite the sentence using the given words, add NO MORE THAN FIVE WORDS if necessary: 'our family, / baking secrets / typically / pass down / one generation / next.'", suggestedAnswer: "In our family, baking secrets are typically passed down from one generation to the next." },
            { topic: "Viết lại câu", question: "Rewrite the sentence using the given words, add NO MORE THAN FIVE WORDS if necessary: 'Cut down / screen time / bedtime / improve / quality / your sleep.'", suggestedAnswer: "Cutting down on screen time before bedtime can improve the quality of your sleep." },
            { topic: "Viết lại câu", question: "Complete the second sentence so that it means the same as the first one. Use the word in brackets (WHERE): 'Do you know the locations to buy traditional handicrafts?'", suggestedAnswer: "Do you know **where to buy** traditional handicrafts?" },
            { topic: "Viết lại câu", question: "Complete the second sentence so that it means the same as the first one. Use the word in brackets (PASS): 'The local weavers typically hand down their weaving techniques to their eldest daughters.'", suggestedAnswer: "The local weavers have a tradition **of passing down** their weaving techniques to their eldest daughters." }
        ]
    }
];