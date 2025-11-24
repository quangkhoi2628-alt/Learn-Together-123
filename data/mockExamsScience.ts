import { AnyMockExam } from '../types';

export const MOCK_EXAMS_SCIENCE: { [key in 'midterm1' | 'final1' | 'midterm2' | 'final2']?: AnyMockExam[] } = {
    "midterm1": [
        {
            id: 'khtn9-gk1-de1-mcq',
            title: 'Đề 1 (2024-2025) - Trắc nghiệm',
            source: 'Đề kiểm tra giữa học kì 1, 2024-2025',
            questions: [
                // Vật lí
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Vật lí: Thế năng",
                    question: "Nếu chọn mặt đất làm mốc để tính thế năng thì trong các vật sau đây vật nào không có thế năng?",
                    options: ["Máy bay đang bay trên cao.", "Chiếc lá đang rơi.", "Một người đứng trên tầng ba của tòa nhà.", "Quả bóng nằm yên trên sàn nhà."],
                    correctAnswer: "Quả bóng nằm yên trên sàn nhà.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Vật lí: Động năng",
                    question: "Nếu khối lượng của vật giảm đi 2 lần, còn tốc độ của vật tăng lên 4 lần thì động năng của vật thay đổi như thế nào?",
                    options: ["tăng lên 2 lần.", "tăng lên 8 lần.", "giảm đi 2 lần.", "giảm đi 8 lần."],
                    correctAnswer: "tăng lên 8 lần.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Vật lí: Công suất",
                    question: "Công suất có các đơn vị đo là:",
                    options: ["J, BTU, cal.", "J, cal, W.", "W, HP, BTU.", "W, HP, BTU/h."],
                    correctAnswer: "W, HP, BTU.",
                    grade: 9
                },
                // Hóa học
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Hóa học: Tính chất của kim loại",
                    question: "Dùng búa đập vào sợi dây nhôm, sợi dây bị cán mỏng dẹt ra. Điều này chứng tỏ nhôm có tính chất nào sau đây?",
                    options: ["tính dẻo.", "tính cứng.", "tính rắn chắc.", "tính bền."],
                    correctAnswer: "tính dẻo.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Hóa học: Điều chế kim loại",
                    question: "Phương pháp nhiệt luyện với chất phản ứng $CO$ có thể tách được kim loại nào sau đây ra khỏi oxide của nó?",
                    options: ["Au.", "Al.", "Fe.", "Ca."],
                    correctAnswer: "Fe.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Hóa học: Dãy hoạt động hóa học",
                    question: "Cho các cặp chất sau: $Cu$ và $HCl$; $Fe$ và $AgNO_3$; $Zn$ và $Pb(NO_3)_2$; $Fe$ và $MgSO_4$; $Al$ và $HCl$. Có bao nhiêu cặp chất xảy ra phản ứng?",
                    options: ["2.", "3.", "4.", "5."],
                    correctAnswer: "3.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Hóa học: Hợp chất của nhôm",
                    question: "Thành phần chính của quặng bauxite là",
                    options: ["$Fe_3O_4$.", "$AlCl_3$.", "$Al_2O_3$.", "$Al_2(SO_4)_3$."],
                    correctAnswer: "$Al_2O_3$.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Hóa học: Kim loại và phi kim",
                    question: "Dựa vào tính chất nào sau đây cho thấy sự khác nhau giữa kim loại và phi kim?",
                    options: ["Màu sắc.", "Khả năng tan trong nước.", "Trạng thái.", "Khả năng dẫn điện."],
                    correctAnswer: "Khả năng dẫn điện.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Hóa học: Ứng dụng của lưu huỳnh",
                    question: "Lĩnh vực nào sau đây **không** phải là ứng dụng của lưu huỳnh?",
                    options: ["Lưu hoá cao su.", "Làm chín hoa quả.", "Sản xuất sulfuric acid.", "Sản xuất pháo hoa, diêm."],
                    correctAnswer: "Làm chín hoa quả.",
                    grade: 9
                },
                // Sinh học
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Sinh học: Di truyền",
                    question: "Di truyền học khẳng định nhân tố di truyền chính là",
                    options: ["DNA.", "nhiễm sắc thể.", "gene.", "protein."],
                    correctAnswer: "gene.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Sinh học: Quy luật Mendel",
                    question: "Kết quả thí nghiệm lai một tính trạng được Mendel giải thích bằng sự phân li của cặp",
                    options: ["nhân tố di truyền.", "gene.", "nhiễm sắc thể thường.", "nhiễm sắc thể giới tính."],
                    correctAnswer: "nhân tố di truyền.",
                    grade: 9
                },
                {
                    subject: "Khoa học tự nhiên",
                    topic: "Sinh học: Lai phân tích",
                    question: "Cho lai giữa các giống đậu Hà Lan khác nhau về 2 tính trạng tương phản, thuần chủng, thu được $F_1$. Cho $F_1$ lai phân tích thu được kiểu hình có tỉ lệ là",
                    options: ["3:1.", "1:1", "1:1:1:1.", "1:2:1."],
                    correctAnswer: "1:1:1:1.",
                    grade: 9
                }
            ]
        },
        {
            id: 'khtn9-gk1-de1-oe',
            title: 'Đề 1 (2024-2025) - Tự luận',
            source: 'Đề kiểm tra giữa học kì 1, 2024-2025',
            type: 'open-ended',
            questions: [
                // Vật lí
                {
                    topic: "Vật lí: Chuyển hóa năng lượng",
                    question: "**Câu 4 (Vật lí):** Em hãy mô tả sự chuyển hóa thế năng và động năng trong chuyển động của quả bóng được thả từ độ cao h (chọn gốc thế năng tại mặt đất), trong các trường hợp:\n- Quả bóng rơi xuống.\n- Quả bóng nảy lên.",
                    suggestedAnswer: "- Khi quả bóng rơi xuống: Thế năng giảm dần, động năng tăng dần. Có sự chuyển hóa từ thế năng thành động năng.\n- Khi quả bóng nảy lên: Động năng giảm dần, thế năng tăng dần. Có sự chuyển hóa từ động năng thành thế năng."
                },
                {
                    topic: "Vật lí: Công và công suất",
                    question: "**Câu 5 (Vật lí):** Người ta dùng một cần cẩu để nâng một thùng hàng có khối lượng 2500 kg lên độ cao 12 m.\na) Tính trọng lượng của thùng hàng và lực nâng tối thiểu của cần cẩu.\nb) Tính công và công suất của cần cẩu thực hiện được trong thời gian 10 giây.",
                    suggestedAnswer: "a) Trọng lượng của thùng hàng: $P = 10m = 10 \\cdot 2500 = 25000$ N.\nLực nâng tối thiểu của cần cẩu để nâng vật lên đều là $F_{min} = P = 25000$ N.\nb) Công của cần cẩu: $A = F \\cdot s = 25000 \\cdot 12 = 300000$ J.\nCông suất của cần cẩu: $\\mathcal{P} = \\frac{A}{t} = \\frac{300000}{10} = 30000$ W."
                },
                // Hóa học
                {
                    topic: "Hóa học: Phương trình hóa học",
                    question: "**Câu 7 (Hóa học):** Hoàn thành các phương trình hoá học sau:\na) $Mg + ? \\rightarrow MgO$\nb) $Fe_2O_3 + CO \\xrightarrow{t^°} Fe + CO_2$\nc) $K + ? \\rightarrow KOH + H_2$\nd) $Cu + ? \\rightarrow Cu(NO_3)_2 + Ag$",
                    suggestedAnswer: "a) $2Mg + O_2 \\xrightarrow{t^°} 2MgO$\nb) $Fe_2O_3 + 3CO \\xrightarrow{t^°} 2Fe + 3CO_2$\nc) $2K + 2H_2O \\rightarrow 2KOH + H_2 \\uparrow$\nd) $Cu + 2AgNO_3 \\rightarrow Cu(NO_3)_2 + 2Ag\\downarrow$"
                },
                {
                    topic: "Hóa học: Môi trường",
                    question: "**Câu 8 (Hóa học):** Khí thải trong sản xuất gang, thép thường chứa các khí gì? Nếu khí này được đưa thẳng ra ngoài môi trường mà không qua xử lí thì sẽ gây ảnh hưởng như thế nào tới môi trường sống?",
                    suggestedAnswer: "- Khí thải trong sản xuất gang, thép thường chứa các khí độc như $CO$, $CO_2$, $SO_2$,... và bụi.\n- Ảnh hưởng tới môi trường: Gây ô nhiễm không khí, gây hiệu ứng nhà kính làm Trái Đất nóng lên, gây mưa axit phá hoại mùa màng và các công trình xây dựng, ảnh hưởng xấu đến sức khỏe con người (gây các bệnh về đường hô hấp)."
                },
                {
                    topic: "Hóa học: Bài toán hỗn hợp",
                    question: "**Câu 9 (Hóa học):** Cho 24 gam hỗn hợp gồm Fe và Cu tác dụng với dung dịch HCl 2M vừa đủ, thu được 0.2 mol khí $H_2$ và còn lại m gam kim loại không tan.\na) Tính m.\nb) Tính thể tích dung dịch HCl 2M đã dùng.\nc) Tính nồng độ mol của chất tan trong dung dịch sau phản ứng. Biết thể tích dung dịch sau phản ứng thay đổi không đáng kể.\n(Cho $Cu=64; Fe=56; Cl=35.5; H=1$)",
                    suggestedAnswer: "Chỉ có Fe phản ứng với HCl, Cu không phản ứng.\nPTHH: $Fe + 2HCl \\rightarrow FeCl_2 + H_2 \\uparrow$\nTheo PTHH, $n_{Fe} = n_{H_2} = 0.2$ mol.\na) Khối lượng Fe: $m_{Fe} = 0.2 \\cdot 56 = 11.2$ g.\nKhối lượng Cu (kim loại không tan): $m = m_{Cu} = 24 - 11.2 = 12.8$ g.\nb) Theo PTHH, $n_{HCl} = 2n_{H_2} = 2 \\cdot 0.2 = 0.4$ mol.\nThể tích dung dịch HCl: $V_{HCl} = \\frac{n}{C_M} = \\frac{0.4}{2} = 0.2$ lít (200 ml).\nc) Chất tan sau phản ứng là $FeCl_2$. Theo PTHH, $n_{FeCl_2} = n_{H_2} = 0.2$ mol.\nNồng độ mol của $FeCl_2$: $C_{M(FeCl_2)} = \\frac{n}{V} = \\frac{0.2}{0.2} = 1$ M."
                },
                // Sinh học
                {
                    topic: "Sinh học: Lai phân tích",
                    question: "**Câu 4 (Sinh học):** Thế nào là phép lai phân tích? Nêu vai trò của phép lai phân tích.",
                    suggestedAnswer: "- Phép lai phân tích là phép lai giữa cá thể mang tính trạng trội cần xác định kiểu gen với cá thể mang tính trạng lặn.\n- Vai trò: Dùng để xác định kiểu gen của cá thể mang tính trạng trội là đồng hợp tử hay dị hợp tử. Nếu kết quả phép lai là đồng tính thì cá thể trội có kiểu gen đồng hợp. Nếu kết quả phép lai là phân tính thì cá thể trội có kiểu gen dị hợp."
                },
                {
                    topic: "Sinh học: Sơ đồ lai",
                    question: "**Câu 5 (Sinh học):** Ở đậu Hà Lan, tiến hành lai giữa các cá thể thuần chủng hạt vàng với hạt xanh. $F_1$ thu được 100% hạt vàng. Cho $F_1$ tự thụ phấn, $F_2$ thu được cả hạt vàng và hạt xanh với tỉ lệ 3 hạt vàng : 1 hạt xanh.\na) Hãy sử dụng các kí hiệu và thuật ngữ để mô tả thí nghiệm trên bằng sơ đồ lai.\nb) Xác định tính trạng trội, tính trạng lặn trong phép lai trên.",
                    suggestedAnswer: "a) Quy ước gen: A - hạt vàng, a - hạt xanh.\nP (t/c): Hạt vàng (AA) x Hạt xanh (aa)\n$G_P$: A, a\n$F_1$: 100% Aa (kiểu hình 100% hạt vàng)\n$F_1 \\times F_1$: Aa (vàng) x Aa (vàng)\n$G_{F1}$: A, a\n$F_2$: 1 AA : 2 Aa : 1 aa\nKiểu hình $F_2$: 3 hạt vàng : 1 hạt xanh.\nb) Từ kết quả $F_1$ và $F_2$, ta xác định được: Tính trạng hạt vàng là trội hoàn toàn so với tính trạng hạt xanh."
                }
            ]
        }
    ],
    "final1": [
        {
            id: 'khtn9-ck1-de2-mcq',
            title: 'Đề 2 (2024-2025) - Trắc nghiệm',
            source: 'Đề kiểm tra cuối học kì 1, 2024-2025',
            questions: [
                { subject: "Khoa học tự nhiên", topic: "Sinh học: Di truyền", question: "Hiện tượng truyền đạt các tính trạng của tổ tiên cho các thế hệ con cháu được gọi là", options: ["di truyền.", "biến dị.", "đột biến.", "thường biến."], correctAnswer: "di truyền.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Sinh học: Gene", question: "Gene được coi là trung tâm của di truyền học vì", options: ["chỉ tồn tại ở thực vật.", "không ảnh hưởng đến tính trạng.", "quy định các tính trạng của sinh vật.", "tham gia vào quá trình chuyển hóa."], correctAnswer: "quy định các tính trạng của sinh vật.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp chất hữu cơ", question: "Hợp chất hữu cơ là gì?", options: ["Hợp chất của kim loại và phi kim.", "Hợp chất chỉ chứa cacbon và hidro.", "Hợp chất được tạo thành từ các nguyên tố phi kim.", "Hợp chất chứa cacbon, ngoại trừ các oxit của cacbon, muối cacbonat, cacbua và xyanua."], correctAnswer: "Hợp chất chứa cacbon, ngoại trừ các oxit của cacbon, muối cacbonat, cacbua và xyanua.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Phân loại hợp chất hữu cơ", question: "Hợp chất hữu cơ được phân loại sơ bộ thành những nhóm nào?", options: ["Hiđrocacbon và các oxit của cacbon.", "Hiđrocacbon và dẫn xuất của hiđrocacbon.", "Dẫn xuất của hiđrocacbon và muối cacbonat.", "Hiđrocacbon và các hợp chất chứa kim loại."], correctAnswer: "Hiđrocacbon và dẫn xuất của hiđrocacbon.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp chất hữu cơ", question: "Trong các công thức sau, chất nào là hợp chất hữu cơ?", options: ["$HCl$.", "$NH_3$.", "$C_6H_{12}O_6$.", "$K_2CO_3$."], correctAnswer: "$C_6H_{12}O_6$.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp chất hữu cơ", question: "Công thức nào sau đây không phải là hợp chất hữu cơ?", options: ["$C_2H_6$.", "$CO$.", "$CH_3Cl$.", "$C_3H_8$."], correctAnswer: "$CO$.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp chất vô cơ", question: "Chọn chất vô cơ trong các chất sau", options: ["$NaHCO_3$.", "$C_3H_8$.", "$C_2H_4$.", "$C_2H_6O$."], correctAnswer: "$NaHCO_3$.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Ion", question: "Kim loại và phi kim khác nhau ở khả năng tạo ion như thế nào?", options: ["Kim loại có xu hướng tạo ion dương, phi kim tạo ion âm.", "Kim loại có xu hướng tạo ion âm, phi kim tạo ion dương.", "Cả kim loại và phi kim đều không tạo ion.", "Cả kim loại và phi kim đều tạo ion âm."], correctAnswer: "Kim loại có xu hướng tạo ion dương, phi kim tạo ion âm.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Công thức phân tử", question: "Công thức phân tử biểu thị điều gì?", options: ["Số lượng và cách sắp xếp các nguyên tử trong phân tử.", "Số lượng nguyên tử của mỗi nguyên tố trong phân tử.", "Cách liên kết giữa các nguyên tử trong phân tử.", "Khối lượng phân tử của hợp chất."], correctAnswer: "Số lượng nguyên tử của mỗi nguyên tố trong phân tử.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Năng lượng", question: "Ưu điểm của năng lượng hóa thạch là", options: ["có thể khai thác với khối lượng lớn, không gây hiệu ứng nhà kính.", "có thể khai thác với khối lượng lớn, dễ vận chuyển.", "dễ vận chuyển, không gây ô nhiễm môi trường.", "không gây ô nhiễm môi trường, dễ khai thác."], correctAnswer: "có thể khai thác với khối lượng lớn, dễ vận chuyển.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Năng lượng", question: "Đâu không phải là ưu điểm của các nguồn năng lượng tái tạo?", options: ["Sẵn có trong tự nhiên để sử dụng.", "Ít tác động tiêu cực đến môi trường.", "Có khả năng bổ sung, tái tạo nhanh chóng.", "Rẻ tiền, là dạng chất đốt quan trọng trong đời sống cũng như sản xuất."], correctAnswer: "Rẻ tiền, là dạng chất đốt quan trọng trong đời sống cũng như sản xuất.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Quang học", question: "Chiết suất của một môi trường được xác định bằng tỉ số nào sau đây?", options: ["Tốc độ ánh sáng trong không khí (hoặc chân không) chia cho tốc độ ánh sáng trong môi trường.", "Tốc độ ánh sáng trong môi trường chia cho tốc độ ánh sáng trong không khí.", "Tốc độ ánh sáng trong môi trường nhân với tốc độ ánh sáng trong không khí.", "Tốc độ ánh sáng trong môi trường trừ tốc độ ánh sáng trong không khí."], correctAnswer: "Tốc độ ánh sáng trong không khí (hoặc chân không) chia cho tốc độ ánh sáng trong môi trường.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Oxit", question: "Khi đốt cháy kim loại và phi kim trong oxi, kết quả nào sau đây đúng?", options: ["Kim loại tạo oxit axit, phi kim tạo oxit base.", "Kim loại tạo oxit base, phi kim tạo oxit axit.", "Cả kim loại và phi kim đều tạo oxit axit.", "Cả kim loại và phi kim đều tạo oxit base."], correctAnswer: "Kim loại tạo oxit base, phi kim tạo oxit axit.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Quang học", question: "Hiện tượng tán sắc ánh sáng qua lăng kính xảy ra khi", options: ["ánh sáng bị hấp thụ hoàn toàn bởi lăng kính.", "ánh sáng truyền qua một bề mặt phẳng song song.", "ánh sáng đổi hướng nhưng không thay đổi màu sắc.", "ánh sáng trắng đi qua lăng kính và bị phân tích thành các màu khác nhau."], correctAnswer: "ánh sáng trắng đi qua lăng kính và bị phân tích thành các màu khác nhau.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Năng lượng", question: "Để sử dụng hiệu quả năng lượng và bảo vệ môi trường trong sinh hoạt hàng ngày, bạn nên làm gì?", options: ["Mua các thiết bị điện tiêu thụ nhiều năng lượng vì chúng hoạt động mạnh hơn.", "Lắp đặt hệ thống điện mặt trời trên mái nhà nếu điều kiện cho phép.", "Sử dụng túi nilon thay cho túi vải để tiết kiệm chi phí.", "Giặt quần áo mỗi ngày bất kể số lượng ít hay nhiều."], correctAnswer: "Lắp đặt hệ thống điện mặt trời trên mái nhà nếu điều kiện cho phép.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Môi trường", question: "Biện pháp nào sau đây là hiệu quả nhất trong việc giảm thiểu ô nhiễm không khí từ phương tiện giao thông?", options: ["Chuyển sang sử dụng phương tiện giao thông công cộng.", "Chỉ sử dụng ô tô cá nhân để đảm bảo an toàn và tiện nghi.", "Tăng tốc độ lái xe để rút ngắn thời gian di chuyển.", "Sử dụng nhiên liệu hóa thạch có giá thấp hơn."], correctAnswer: "Chuyển sang sử dụng phương tiện giao thông công cộng.", grade: 9 }
            ]
        },
        {
            id: 'khtn9-ck1-de2-oe',
            title: 'Đề 2 (2024-2025) - Tự luận',
            source: 'Đề kiểm tra cuối học kì 1, 2024-2025',
            type: 'open-ended',
            questions: [
                {
                    topic: "Vật lí: Quang học",
                    question: "**Câu 1 (Vật lí):**\na) Phát biểu định luật khúc xạ ánh sáng.\nb) Nêu điều kiện để nhìn thấy màu sắc của một vật?\nc) Một tia sáng truyền từ không khí đến bề mặt phẳng yên tĩnh của một chất lỏng trong suốt dưới góc tới $45^\\circ$ thì góc khúc xạ của tia sáng trong chất lỏng là $32^\\circ$. Xác định chiết suất của chất lỏng.\nd) Giải thích vì sao khi nhìn lên trên bầu trời vào ban ngày ta thường thấy những đám mây màu trắng, nhưng có lúc lại thấy có những đám mây màu xám đen.",
                    suggestedAnswer: "a) Định luật khúc xạ ánh sáng:\n- Tia khúc xạ nằm trong mặt phẳng tới.\n- Tia khúc xạ và tia tới nằm ở hai bên pháp tuyến tại điểm tới.\n- Với hai môi trường trong suốt nhất định, tỉ số giữa sin của góc tới (i) và sin của góc khúc xạ (r) là một hằng số: $\\frac{\\sin i}{\\sin r} = n$ (n là chiết suất tỉ đối).\nb) Điều kiện để nhìn thấy màu sắc của một vật là có ánh sáng từ vật đó truyền vào mắt ta. Màu sắc của vật phụ thuộc vào khả năng phản xạ và hấp thụ ánh sáng màu của vật đó.\nc) Áp dụng công thức định luật khúc xạ ánh sáng: $n = \\frac{\\sin i}{\\sin r} = \\frac{\\sin 45^\\circ}{\\sin 32^\\circ} \\approx 1.33$.\nd) Mây màu trắng do các hạt nước nhỏ li ti tán xạ đều tất cả các ánh sáng màu từ Mặt Trời. Mây có màu xám đen khi chúng dày và ở tầng thấp, ánh sáng Mặt Trời không xuyên qua được nên mặt dưới của đám mây không được chiếu sáng."
                },
                {
                    topic: "Sinh học: Di truyền",
                    question: "**Câu 2 (Sinh học):**\na) Mã di truyền là gì?\nb) Cho 1 ví dụ về mã di truyền?",
                    suggestedAnswer: "a) Mã di truyền là trình tự các nuclêôtit trong gen (hoặc trong mARN) quy định trình tự các axit amin trong phân tử prôtêin.\nb) Ví dụ: bộ ba AUG trên mARN mã hóa cho axit amin Mêtiônin ở sinh vật nhân thực và đóng vai trò là tín hiệu mở đầu quá trình dịch mã."
                },
                {
                    topic: "Hóa học: Phản ứng hóa học, Hợp kim",
                    question: "**Câu 3 (Hóa học):**\na) Viết PTHH xảy ra khi cho kim loại Al tác dụng với dung dịch HCl.\nb) Dự đoán hiện tượng xảy ra khi cho kim loại Al tác dụng với dung dịch $CuSO_4$? Viết PTHH xảy ra.\nc) Vì sao các hợp kim tạo thành lại cứng hơn so với kim loại ban đầu?",
                    suggestedAnswer: "a) $2Al + 6HCl \\rightarrow 2AlCl_3 + 3H_2 \\uparrow$\nb) Hiện tượng: Mẩu nhôm tan dần, có chất rắn màu đỏ (đồng) bám vào bề mặt mẩu nhôm, màu xanh của dung dịch nhạt dần. PTHH: $2Al + 3CuSO_4 \\rightarrow Al_2(SO_4)_3 + 3Cu \\downarrow$\nc) Hợp kim cứng hơn kim loại ban đầu vì trong hợp kim, ngoài các nguyên tử kim loại còn có các nguyên tử của nguyên tố khác. Sự khác nhau về kích thước nguyên tử làm sai lệch cấu trúc mạng tinh thể của kim loại, gây khó khăn cho sự trượt của các lớp nguyên tử lên nhau, do đó hợp kim cứng và bền hơn."
                },
                {
                    topic: "Sinh học: Đa dạng sinh học; Vật lí: Công suất",
                    question: "**Câu 4 (Tổng hợp):**\na) Giải thích vì sao có sự đa dạng về tính trạng của các loài sinh vật?\nb) Cho ví dụ về sự đa dạng tính trạng ở người?\nc) Ba hộp có trọng lượng 300N. Một người công nhân nhấc tất cả các hộp từ mặt đất lên kệ cách mặt đất 1.5m. Người công nhân mất 2.0 giây để thực hiện công việc này. Hỏi công suất mà người công nhân đã thực hiện để nâng ba hộp trên bằng bao nhiêu?",
                    suggestedAnswer: "a) Sự đa dạng về tính trạng của các loài sinh vật là kết quả của quá trình tiến hóa lâu dài dưới tác động của các nhân tố như đột biến, giao phối và chọn lọc tự nhiên, tạo ra sự đa dạng về gen và kiểu hình.\nb) Ví dụ về sự đa dạng tính trạng ở người: màu da, màu tóc, màu mắt, nhóm máu, chiều cao, hình dạng khuôn mặt...\nc) Công mà người công nhân thực hiện là: $A = F \\cdot s = P \\cdot h = 300 \\cdot 1.5 = 450$ J.\nCông suất của người công nhân là: $\\mathcal{P} = \\frac{A}{t} = \\frac{450}{2} = 225$ W."
                }
            ]
        }
    ],
    "midterm2": [
        {
            id: 'khtn9-gk2-de1-mcq',
            title: 'Đề 1 - Trắc nghiệm (Giữa kì 2)',
            source: 'Đề kiểm tra giữa học kì 2',
            questions: [
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Cơ năng", question: "Tổng động năng và thế năng của vật được gọi là", options: ["nhiệt năng", "cơ năng.", "điện năng", "hóa năng."], correctAnswer: "cơ năng.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Vật lí: Công cơ học", question: "Đơn vị của công cơ học là", options: ["jun (J).", "niutơn (N).", "mét (m).", "ampe (A)."], correctAnswer: "jun (J).", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp kim", question: "Để có thể sử dụng làm vỏ máy bay, tên lửa hay tàu vũ trụ thì các loại hợp kim được dùng phải có tính chất", options: ["nhẹ, bền, chịu được nhiệt độ cao, áp suất cao.", "không gỉ, có tính dẻo cao.", "có tính cứng cao.", "có tính dẫn điện tốt."], correctAnswer: "nhẹ, bền, chịu được nhiệt độ cao, áp suất cao.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp kim", question: "Phát biểu nào sau đây không đúng về hợp kim?", options: ["Tính dẫn điện của hợp kim giảm so với kim loại thành phần tạo nên hợp kim.", "Tính dẫn nhiệt của hợp kim giảm so với kim loại thành phần tạo nên hợp kim.", "Tính dẻo của hợp kim giảm so với kim loại thành phần tạo nên hợp kim.", "Hợp kim mềm hơn so với các kim loại tạo nên hợp kim."], correctAnswer: "Hợp kim mềm hơn so với các kim loại tạo nên hợp kim.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Hợp kim của Sắt", question: "Gang và thép là hợp kim của:", options: ["iron (Fe) với carbon (C).", "carbon (C) với silicon (Si).", "aluminium (Al) với copper (Cu).", "iron (Fe) với aluminium (Al)."], correctAnswer: "iron (Fe) với carbon (C).", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Luyện kim", question: "Nguyên tắc sản xuất gang là", options: ["làm giảm hàm lượng Al", "dùng carbon mono oxide (CO) khử iron oxide ở nhiệt độ cao trong lò luyện kim.", "làm giảm hàm lượng các nguyên tố C, Si, Mn...", "làm giảm hàm lượng của Fe"], correctAnswer: "dùng carbon mono oxide (CO) khử iron oxide ở nhiệt độ cao trong lò luyện kim.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Dãy hoạt động hóa học", question: "Dãy kim loại nào sau đây được sắp xếp theo chiều hoạt động hóa học giảm dần?", options: ["K, Al, Mg, Cu, Fe.", "Cu, Fe, Mg, Al, K.", "K, Mg, Fe, Cu, Ag.", "K, Cu, Al, Mg, Fe."], correctAnswer: "K, Mg, Fe, Cu, Ag.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Phản ứng hóa học", question: "Hiện tượng gì xảy ra khi cho một thanh đồng (copper) Cu vào dung dịch sulfuric acid $H_2SO_4$ đặc nóng?", options: ["Thanh đồng tan dần, có khí không màu mùi hắc thoát ra dung dịch chuyển thành màu xanh lam.", "Thanh đồng tan dần, dung dịch chuyển thành màu xanh lam.", "Xuất hiện kết tủa trắng.", "Không có hiện tượng xảy ra."], correctAnswer: "Thanh đồng tan dần, có khí không màu mùi hắc thoát ra dung dịch chuyển thành màu xanh lam.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Phản ứng hóa học", question: "Hiện tượng gì xảy ra khi 3-4 đinh sắt iron (Fe) vào dung dịch sulfuric acid $H_2SO_4$ loãng?", options: ["Đinh sắt tan dần, có khí không màu thoát ra.", "Đinh sắt tan dần, dung dịch chuyển dần thành màu xanh lam.", "Xuất hiện kết tủa trắng.", "Không có hiện tượng xảy ra."], correctAnswer: "Đinh sắt tan dần, có khí không màu thoát ra.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Phản ứng hóa học", question: "Hiện tượng gì xảy ra khi cho một thanh silver (Ag) vào dung dịch copper (II) nitrate $Cu(NO_3)_2$ loãng?", options: ["Không có hiện tượng gì xảy ra.", "Thanh đồng tan dần, dung dịch chuyển dần thành màu xanh lam.", "Xuất hiện kết tủa trắng, có khí không màu thoát ra", "Thanh đồng tan dần có một lớp chất rắn màu trắng bám trên thanh đồng, dung dịch chuyển dần thành màu xanh lam"], correctAnswer: "Không có hiện tượng gì xảy ra.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Phản ứng hóa học", question: "Dãy các kim loại đều tác dụng được với sulfuric acid $H_2SO_4$ là:", options: ["Cu, Mg, Fe", "Mg, Fe, Zn", "Ag, Zn, Fe", "Ag, Zn, Al"], correctAnswer: "Mg, Fe, Zn", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Hóa học: Phản ứng hóa học", question: "Kim loại nào sau đây tác dụng được với nước ở nhiệt độ thường là", options: ["K", "Cu", "Ag", "Fe"], correctAnswer: "K", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Sinh học: Biến dị", question: "Nội dung nào dưới đây không đúng khi nói về biến dị?", options: ["Con cái sinh ra không giống với bố, mẹ chúng.", "Ở loài sinh sản hữu tính, có sự tổ hợp các gene của bố, mẹ tạo ra các biến dị.", "Bố mắt đen sinh ra con mắt đen là một biến dị.", "Bố, mẹ bình thường sinh con mắc bệnh Down là một biến dị."], correctAnswer: "Bố mắt đen sinh ra con mắt đen là một biến dị.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Sinh học: Di truyền", question: "Yếu tố quy định di truyền và biến dị ở sinh vật là", options: ["di truyền học", "thế hệ bố mẹ", "gene", "allele"], correctAnswer: "gene", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Sinh học: Di truyền", question: "Vì sao ý tưởng của Mendel là cơ sở cho những nghiên cứu về nhân tố di truyền", options: ["vì Mendel đã nhận định con chỉ nhận được nhân tố di truyền từ bố.", "vì Mendel đã nhận định con chỉ nhận được nhân tố di truyền từ mẹ.", "vì Mendel nhận định bố mẹ truyền cho con những nhân tố riêng biệt, các nhân tố này mất đi một nửa ở thế hệ sau.", "vì Mendel nhận định bố mẹ truyền cho con những nhân tố riêng biệt, các nhân tố này không bị mất đi mà giữ nguyên ở thế hệ sau."], correctAnswer: "vì Mendel nhận định bố mẹ truyền cho con những nhân tố riêng biệt, các nhân tố này không bị mất đi mà giữ nguyên ở thế hệ sau.", grade: 9 },
                { subject: "Khoa học tự nhiên", topic: "Sinh học: Gene và mã di truyền", question: "Các đoạn DNA mang thông tin di truyền mã hóa cho một sản phẩm nhất định nào đó được gọi là", options: ["RNA.", "nhiễm sắc thể.", "nhân tế bào.", "gene."], correctAnswer: "gene.", grade: 9 }
            ]
        },
        {
            id: 'khtn9-gk2-de1-oe',
            title: 'Đề 1 - Tự luận (Giữa kì 2)',
            source: 'Đề kiểm tra giữa học kì 2',
            type: 'open-ended',
            questions: [
                {
                    topic: "Hóa học: Hợp kim và PƯHH",
                    question: "**Câu 1 (Hóa học):**\na. Hợp kim là gì? Em hãy nêu một số loại hợp kim được sử dụng trong đời sống mà em biết.\nb. Hoàn thành các phản ứng hoá học sau:\n1) $Al + AgNO_3 \\rightarrow$ ?\n2) $? + O_2 \\rightarrow Al_2O_3$\n3) $Al + HCl \\rightarrow$ ?\n4) $Na + ? \\rightarrow NaCl$",
                    suggestedAnswer: "a. Hợp kim là chất rắn thu được sau khi làm nguội hỗn hợp nóng chảy của nhiều kim loại khác nhau hoặc của kim loại và phi kim. Một số loại hợp kim được sử dụng trong đời sống: inox, gang, thép, đồng thau,...\nb. Hoàn thành các phản ứng:\n1) $Al + 3AgNO_3 \\rightarrow Al(NO_3)_3 + 3Ag\\downarrow$\n2) $4Al + 3O_2 \\xrightarrow{t^°} 2Al_2O_3$\n3) $2Al + 6HCl \\rightarrow 2AlCl_3 + 3H_2 \\uparrow$\n4) $2Na + Cl_2 \\xrightarrow{t^°} 2NaCl$"
                },
                {
                    topic: "Sinh học: Quy luật phân li",
                    question: "**Câu 2 (Sinh học):** Giải thích kết quả thí nghiệm lai một cặp tính trạng của Mendel khi cho lai hoa tím thuần chủng với hoa trắng. Phát biểu quy luật phân li của Mendel?",
                    suggestedAnswer: "- Giải thích kết quả: Mỗi cây thuần chủng thuộc thế hệ bố mẹ có hai nhân tố di truyền (allele) giống hệt nhau. Khi giảm phân tạo giao tử, mỗi nhân tố di truyền phân li về một giao tử. Sự tổ hợp tự do của các loại giao tử trong quá trình thụ tinh đã thu được ở F2 có 4 tổ hợp giao tử với tỉ lệ 3 hoa tím : 1 hoa trắng (3 trội : 1 lặn).\n- Quy luật phân li: Mỗi tính trạng do một cặp nhân tố di truyền quy định. Trong quá trình phát sinh giao tử, mỗi nhân tố trong cặp nhân tố di truyền phân li về một giao tử. Mỗi giao tử chỉ chứa một trong hai nhân tố di truyền trong cặp nhân tố di truyền."
                },
                {
                    topic: "Vật lí: Cơ năng",
                    question: "**Câu 3 (Vật lí):** Một quả bóng khối lượng 450 g được thả rơi từ điểm A có độ cao 1.6 m xuống nền đất cứng và bật trở lên đến điểm B có độ cao 1.2 m. Tính cơ năng tại A và tại B của quả bóng (lấy $g = 10 m/s^2$)",
                    suggestedAnswer: "Đổi 450 g = 0.45 kg.\nCơ năng tại A (chỉ có thế năng): $W_A = W_{tA} = m \\cdot g \\cdot h_A = 0.45 \\cdot 10 \\cdot 1.6 = 7.2$ J.\nCơ năng tại B (coi vận tốc tại điểm cao nhất bằng 0, chỉ có thế năng): $W_B = W_{tB} = m \\cdot g \\cdot h_B = 0.45 \\cdot 10 \\cdot 1.2 = 5.4$ J."
                },
                {
                    topic: "Vật lí: Khúc xạ ánh sáng",
                    question: "**Câu 4 (Vật lí):** Vì sao khi đứng trên thành hồ bơi, ta lại thấy đáy hồ bơi có vẻ gần mặt nước hơn so với thực tế?",
                    suggestedAnswer: "Các tia sáng xuất phát từ đáy hồ bơi, truyền thẳng trong nước, nhưng bị khúc xạ ngay tại mặt phân cách giữa nước và không khí rồi truyền thẳng đến mắt người quan sát ở môi trường không khí. Do hiện tượng khúc xạ, mắt người quan sát sẽ nhìn thấy ảnh ảo của đáy hồ bơi ở vị trí cao hơn (gần mặt nước hơn) so với vị trí thực tế của nó."
                }
            ]
        }
    ]
}