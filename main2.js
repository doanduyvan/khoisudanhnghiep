

let arridquiz_origin = getQuestion().map((quiz) => quiz.id);

let arridquiz = getQuestion().map((quiz) => quiz.id);

let globaltype = 2;

// bien toan cuc luu trang thai hien tai cua quiz

let currentIndex = 0;
let currentQuiz = null;
let currentType = null;
let currentResult = [];
let sstanswertemp = null;

const arrWrong = [];
let Count = 0;

// random array 


function randomQuiz() {
    if (arridquiz.length <= 1) {
        return;
    }
    let randomElement;
    if (arrWrong.length == 0 || Count != 4) {
        while (true) {
            randomElement = arridquiz[Math.floor(Math.random() * arridquiz.length)];
            if (randomElement == currentQuiz.id) {
                continue;
            }
            break;
        }
    } else {
        randomElement = arrWrong.shift();
        Count = 0;
    }
    if (arrWrong.length > 0) {
        Count++;
        if (Count >= 5) {
            Count = 0;
        }
    }

    renderQuiz(getQuestion(randomElement));
    console.log('arrWrong: ', arrWrong);
    console.log('Count: ', Count);
}


renderQuiz(getQuestion(1));

function renderQuiz(quiz, isSubmit = false) {

    if (!isSubmit) {
        currentQuiz = quiz;
        currentResult = [];
        currentType = quiz.true_answer.length > 1 ? "checkbox" : "radio";
        currentIndex = arridquiz.findIndex((id) => id === quiz.id);
    }

    const infoText = quiz.true_answer.length > 1 ? "Chọn 1 hoặc nhiều câu đúng" : "Chọn 1 câu đúng";

    const html = document.createElement("div");
    html.classList.add("quiz-container");
    html.innerHTML = `
            <p class="info2">Phương pháp học lặp lại ngắt quãng</p>
            <div class="btn-options">
                <button class="nav-btn ${globaltype == 1 && "active"}" onclick="chooseType(1)">60 Câu đầu đã sửa</button>
                <button class="nav-btn ${globaltype == 2 && "active"}" onclick="chooseType(2)">Tất cả</button>
                <button class="nav-btn ${globaltype == 3 && "active"}" onclick="chooseType(3)">60 Câu sau đã sửa</button>
            </div>
            <div class="current_quiz">Câu: ${quiz.id}</div>
        <div class="progress-circle">
            <div class="circle">
                <span>${arridquiz_origin.length - arridquiz.length}/${arridquiz_origin.length}</span>
            </div>
        </div>
        <div class="question-section">
            <p class="question">${quiz.name}</p>
            <p class="info1">${infoText}</p>
            <div class="options"></div>
            <p class="info3">Các câu trả lời đã được xáo trộn</p>
        </div>
        <div class="navigation">
            <button class="nav-btn hidden" onclick="nextandprev(false)">Prev</button>
            <button class="nav-btn" onclick="randomQuiz()">Random</button>
            <button class="nav-btn hidden" onclick="nextandprev(true)">Next</button>
            <button class="nav-btn submit" ${isSubmit ? "disabled" : ""}>Submit</button>
        </div>
        <div class="navigation-btn">
            <button class="nav-btn hidden" onclick="resetall()">Reset ALL</button>
        </div>
    `;
    const oldoptions = html.querySelector(".options");
    const options = compareAnswer(quiz.answers, quiz.true_answer.length > 1 ? "checkbox" : "radio", isSubmit);
    oldoptions && oldoptions.replaceWith(options);
    const oldHtml = document.querySelector(".quiz-container");
    oldHtml && oldHtml.replaceWith(html);

    const submit = html.querySelector(".nav-btn.submit");
    if (!isSubmit) {
        submit.onclick = submitAnswer;
    }
}

function compareAnswer(arr1, typeInput, isSubmit = false) {
    const arr2 = shuffleArrayIndexes(arr1);
    let arr = arr2;
    if (isSubmit) {
        arr = sstanswertemp;
    } else {
        sstanswertemp = arr2;
    }

    const STT = ["A", "B", "C", "D"];
    const options = document.createElement("div");
    options.classList.add("options");
    arr.forEach((item, index) => {
        const label = document.createElement("label");
        label.classList.add("option");
        const input = document.createElement("input");
        input.type = typeInput;
        input.name = typeInput == "radio" ? "answer" : "answer" + item.id;
        input.value = item.id;
        const text = document.createTextNode(`${STT[index]}. ${item.text}`);
        label.appendChild(input);
        label.appendChild(text);
        options.appendChild(label);

        if (isSubmit) {
            if (currentQuiz.true_answer.includes(item.id)) {
                label.classList.add("true");
            }
            if (currentResult.find((it) => it.id === item.id)) {
                if (currentQuiz.true_answer.includes(item.id)) {
                    label.classList.add("true");
                    label.click();
                } else {
                    label.classList.add("false");
                    label.click();
                }
            }
            input.disabled = true;
        } else {

            input.onchange = function () {
                let itemresult = {
                    id: item.id,
                    isCorrect: null
                };

                if (typeInput == "radio") {
                    currentResult = [itemresult];
                } else {
                    if (input.checked) {
                        currentResult.push(itemresult);
                    } else {
                        currentResult = currentResult.filter((it) => it.id !== item.id);
                    }
                }
            }
        }

    });
    return options;
}

function submitAnswer() {

    if (currentResult.length === 0) {
        modal("Chọn câu trả lời");
        return;
    }
    let idTrueQuiz = currentQuiz.id;
    for (let i = 0; i < currentResult.length; i++) {
        if (currentQuiz.true_answer.includes(currentResult[i].id)) {
            currentResult[i].isCorrect = true;
        } else {
            currentResult[i].isCorrect = false;
            idTrueQuiz = null;
        }
    }
    if(currentQuiz.true_answer.length > 1 && currentResult.length != currentQuiz.true_answer.length){
        idTrueQuiz = null;
    }
    idTrueQuiz && modal("Chúc mừng bạn đã trả lời đúng", 2);
    idTrueQuiz || modal("Rất tiếc bạn đã trả lời sai", 2);
    if (idTrueQuiz) {
        arridquiz = arridquiz.filter((id) => id !== idTrueQuiz);
    } else {
        if (!arrWrong.includes(currentQuiz.id)) {
            arrWrong.push(currentQuiz.id);
        }
    }
    renderQuiz(currentQuiz, true);
}

function nextandprev(isNext = true) {

    if (arridquiz.length <= 1) {
        return;
    }

    let index = arridquiz.findIndex((id) => id === currentQuiz.id);
    if (index === -1) {
        index = currentIndex;
        isNext && index--;
    }
    if (isNext) {
        index++;
        if (index >= arridquiz.length) {
            index = 0;
        }
    } else {
        index--;
        if (index < 0) {
            index = arridquiz.length - 1;
        }
    }
    renderQuiz(getQuestion(arridquiz[index]));
}

function resetall() {
    arridquiz = arridquiz_origin;
    renderQuiz(getQuestion(arridquiz[0]));
}

function modal(text, time = 3) {
    // Tạo thẻ modal nếu chưa có

    const oldmodal = document.querySelector(".modal");
    oldmodal && oldmodal.remove();

    const modal = document.createElement("div");
    modal.className = "modal";

    const modalItem = document.createElement("div");
    modalItem.className = "modal-item";
    modalItem.textContent = text;

    modal.appendChild(modalItem);
    document.body.appendChild(modal);

    let timeout;
    let documentClick;

    // Hàm thực hiện fade out và xóa modal
    function removeModal() {
        modalItem.style.animation = "fadeOut 0.3s linear";
        setTimeout(() => {
            modal.remove();
        }, 300); // Thời gian trùng với thời gian animation fadeOut
        document.removeEventListener("click", documentClick); // Hủy lắng nghe click
    }

    // Thiết lập timeout tự động xóa sau thời gian `time` giây
    timeout = setTimeout(() => {
        removeModal();
    }, time * 1000);

    // Lắng nghe sự kiện click để xóa ngay lập tức
    setTimeout(() => {
        documentClick = document.addEventListener("click", () => {
            clearTimeout(timeout); // Hủy timeout để không chạy thêm lần nữa
            removeModal();
        });
    }, 1);

}

function chooseType(type) {
    if (globaltype === type) {
        return;
    }
    globaltype = type;
    const allQuiz = getQuestion().map((quiz) => quiz.id);

    if (type === 1) {
        arridquiz_origin = allQuiz.filter((id) => id <= 60);
        arridquiz = allQuiz.filter((id) => id <= 60);
    }
    if (type === 2) {
        arridquiz_origin = [...allQuiz];
        arridquiz = [...allQuiz];
    }
    if (type === 3) {
        arridquiz_origin = allQuiz.filter((id) => id > 60);
        arridquiz = allQuiz.filter((id) => id > 60);
    }
    renderQuiz(getQuestion(arridquiz[0]));
}

function shuffleArrayIndexes(array) {
    // Tạo một mảng chứa các index của array
    let indexes = array.map((_, index) => index);

    // Sử dụng thuật toán Fisher-Yates để xáo trộn index
    for (let i = indexes.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]]; // Hoán đổi vị trí
    }

    // Tạo một mảng mới dựa trên thứ tự index đã xáo trộn
    let shuffledArray = indexes.map(index => array[index]);

    return shuffledArray;
}

function getQuestion(id = null) {
    const questions = [
        {
            id: 1,
            name: "Doanh nhân thường có kiểu tư duy như thế nào?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Lạc quan và không có khả năng xác định tương lai" },
                { id: "b", text: "Bi quan và khả năng xác định tương lai" },
                { id: "c", text: "Bi quan và không có khả năng xác định tương lai" },
                { id: "d", text: "Lạc quan và có khả năng xác định tương lai" }
            ]
        },
        {
            id: 2,
            name: "Doanh nhân là người được hiểu như thế nào?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Một người độc lập (không thuộc công ty)" },
                { id: "b", text: "Một nhân viên văn phòng" },
                { id: "c", text: "Một người làm nghề tự do" },
                { id: "d", text: "Một người bắt đầu việc kinh doanh riêng của họ" }
            ]
        },
        {
            id: 3,
            name: "Doanh nhân có xu hướng hoạt động xã hội tương tự như tổ chức nào sau đây?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Tổ chức từ thiện" },
                { id: "b", text: "Các nhà từ thiện" },
                { id: "c", text: "Người gây quỹ" },
                { id: "d", text: "Các tổ chức phi lợi nhuận" }
            ]
        },
        {
            id: 4,
            name: "Đâu thường KHÔNG PHẢI là đặc điểm chung của doanh nhân?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Lo xa (Forward thinking)" },
                { id: "b", text: "Giao tiếp xã hội tốt (Gregarious)" }
            ]
        },
        {
            id: 5,
            name: "Một đặc điểm chung mà các doanh nhân thường có là:",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Sự tự tin" },
                { id: "b", text: "Tóc màu sáng" },
                { id: "c", text: "Rất lười biếng" },
                { id: "d", text: "Được miễn vào đại học" }
            ]
        },
        {
            id: 6,
            name: "Đâu thường KHÔNG PHẢI là đặc điểm chung của doanh nhân?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Giao tiếp xã hội tốt (Gregarious)" },
                { id: "b", text: "Tự tin (Confidence)" },
                { id: "c", text: "Cẩn trọng (Careful)" },
                { id: "d", text: "Lo xa (Forward thinking)" }
            ]
        },
        {
            id: 7,
            name: "Doanh nhân là người được hiểu như thế nào?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Một người độc lập (Không thuộc công ty)" },
                { id: "b", text: "Một nhân viên văn phòng" },
                { id: "c", text: "Một người làm nghề tự do" },
                { id: "d", text: "Người bắt đầu việc kinh doanh riêng của họ" }
            ]
        },
        {
            id: 8,
            name: "Một đặc điểm chung mà các doanh nhân thường có là:",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Tóc màu sáng" },
                { id: "b", text: "Sự tự tin" },
                { id: "c", text: "Được miễn vào đại học" },
                { id: "d", text: "Rất lười biếng" }
            ]
        },
        {
            id: 9,
            name: "Đặc điểm nào sau đây KHÔNG PHẢI là đặc điểm tính cách hoặc đặc điểm của doanh nhân?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Tự bắt đầu tạo cơ hội" },
                { id: "b", text: "Cảnh báo các nguy cơ" },
                { id: "c", text: "Thời gian chú ý tập trung ngắn" },
                { id: "d", text: "Nhìn xa trông rộng" }
            ]
        },
        {
            id: 10,
            name: "Một cá nhân bắt đầu, thành lập và quản lý một doanh nghiệp mới được gọi là:",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Doanh nhân" },
                { id: "b", text: "Nhà lãnh đạo" },
                { id: "c", text: "Nhà quản lý" },
                { id: "d", text: "Nhà chuyên môn" }
            ]
        },
        {
            id: 11,
            name: "Học xác thực (validated learning) là gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Học từ trải nghiệm thực tế" },
                { id: "b", text: "Học từ một khóa học trực tuyến" },
                { id: "c", text: "Học bằng cách hỏi người khác về chủ đề" },
                { id: "d", text: "Học bằng cách đọc nghiên cứu của người khác" }
            ]
        },
        {
            id: 12,
            name: "Mô hình kinh doanh mới, đột phá bao gồm? Chọn tất cả phương án đúng",
            true_answer: ["a", "c", "d"],
            answers: [
                { id: "a", text: "Mô hình kinh doanh nền kinh tế chia sẻ (sharing economy Business model)" },
                { id: "b", text: "Mô hình kinh doanh đại lý bán lẻ (retail Business Model)" },
                { id: "c", text: "Mô hình kinh doanh theo nhu cầu (demand business model)" },
                { id: "d", text: "Mô hình kinh doanh dịch vụ cộng đồng (crowdsourcing business model)" }
            ]
        },
        {
            id: 13,
            name: "Kiểu tư duy của người Trung Quốc thường là?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Bi quan và không có khả năng xác định tương lai" },
                { id: "b", text: "Bi quan và có khả năng xác định tương lai" },
                { id: "c", text: "Lạc quan và có khả năng xác định tương lai" },
                { id: "d", text: "Lạc quan và không có khả năng xác định tương lai" }
            ]
        },
        {
            id: 14,
            name: "Đâu là loại hình mối quan hệ khách hàng chưa phổ biến tại Việt Nam?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Quan hệ khách hàng qua tương tác trả lời tự động" },
                { id: "b", text: "Quan hệ khách hàng dựa trên tương tác trực tiếp cá nhân" },
                { id: "c", text: "Quan hệ khách hàng qua email" },
                { id: "d", text: "Quan hệ khách hàng dựa trên người dùng xây dựng hệ sinh thái tương tác" }
            ]
        },
        {
            id: 15,
            name: "Dòng doanh thu từ mô hình doanh thu của doanh nghiệp không bao gồm:",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Phí môi giới" },
                { id: "b", text: "Cho thuê" },
                { id: "c", text: "Quảng cáo truyền miệng" },
                { id: "d", text: "Phí đăng ký dài hạn" }
            ]
        },
        {
            id: 16,
            name: "Mô hình kinh doanh truyền thống bao gồm? Lựa chọn tất cả",
            true_answer: ["b", "d"],
            answers: [
                { id: "a", text: "Mô hình kinh doanh nền kinh tế chia sẻ (sharing economy Business model)" },
                { id: "b", text: "Mô hình kinh doanh đại lý bán lẻ (retail Business Model)" },
                { id: "c", text: "Mô hình kinh doanh theo nhu cầu (demand business model)" },
                { id: "d", text: "Mô hình nhượng quyền thương mại (Franchise Business model)" }
            ]
        },
        {
            id: 17,
            name: "Ý tưởng kinh doanh này sinh dựa trên việc chúng ta tưởng tượng… công ty lớn mới thành lập sẽ phục vụ những nhu cầu đó. Kỹ thuật…",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Ý tưởng kinh doanh dựa trên vấn đề (problem-based business)" },
                { id: "b", text: "Ý tưởng kinh doanh dựa trên lợi ích (Benefit based business)" },
                { id: "c", text: "Trí tưởng tượng đảo ngược (Reverse imagination)" },
                { id: "d", text: "Tưởng tượng về tương lai (Imagine the future)" }
            ]
        },
        {
            id: 18,
            name: "Để có thể xác thực được ý tưởng kinh doanh của bạn thông qua phương pháp tưởng tượng khách hàng mục tiêu. Các công cụ giúp bạn tiếp cận nhóm khách hàng:",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Facebook Group" },
                { id: "b", text: "Diễn đàn Subreddits" },
                { id: "c", text: "Danh sách email" },
                { id: "d", text: "LinkedIn" }
            ]
        },
        {
            id: 19,
            name: "Cách tốt nhất để tiếp cận các nhà đầu tư thiên thần (angle) là gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Nói với họ rằng bạn đang tìm kiếm lời khuyên của người cố vấn quản lý" },
                { id: "b", text: "Gọi cho họ và yêu cầu trả tiền trước" },
                { id: "c", text: "Viết cho họ một email nói lý do tại sao ý tưởng của bạn là tuyệt vời" },
                { id: "d", text: "Gặp họ trực tiếp và phàn nàn về tình hình tài chính của bạn" }
            ]
        },
        {
            id: 20,
            name: "Các hình thức vốn có thể huy động cho khởi nghiệp bao gồm?",
            true_answer: ["a", "c", "d"],
            answers: [
                { id: "a", text: "Vốn riêng khởi nghiệp (bootstrapping)" },
                { id: "b", text: "Vốn cổ phần (Equity)" },
                { id: "c", text: "Vốn đầu tư mạo hiểm (Venture Capital)" },
                { id: "d", text: "Vốn vay (Loans)" }
            ]
        },
        {
            id: 21,
            name: "Google, Facebook là những ví dụ về:",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Phong cách sống" },
                { id: "b", text: "Mức sống" },
                { id: "c", text: "Tiêu chuẩn công nghiệp" },
                { id: "d", text: "Công ty khởi nghiệp" }
            ]
        },
        {
            id: 22,
            name: "Đối với các quỹ đầu tư mạo hiểm, việc đánh giá cơ hội nhận đầu tư của 2 doanh nghiệp sau:<br>1. Doanh nghiệp X có 90% cơ hội thu về doanh thu gấp 2 lần vốn bỏ ra<br>2. Doanh nghiệp Y có 10% cơ hội về doanh thu gấp 20 lần vốn bỏ ra",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Cơ hội nhận được đầu tư của DN X cao hơn DN Y" },
                { id: "b", text: "Cơ hội nhận được đầu tư của DN Y cao hơn DN X" },
                { id: "c", text: "Cơ hội nhận được đầu tư của DN Y và DN X là như nhau" },
                { id: "d", text: "Không có câu trả lời đúng" }
            ]
        },
        {
            id: 23,
            name: "Yếu tố quyết định sự khác nhau giữa thị trường “đại dương đỏ” và “Đại dương xanh”:",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Đối thủ cạnh tranh" },
                { id: "b", text: "Chi phí sản xuất" },
                { id: "c", text: "Nhà cung cấp" },
                { id: "d", text: "Khách hàng" }
            ]
        },
        {
            id: 24,
            name: "Nguyên lý hoạt động của phương pháp này là:",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Bạn xây dựng 1 DN tinh gọn…" },
                { id: "b", text: "Bạn đo lường phản ứng của khách hàng khi tiếp cận doanh nghiệp" },
                { id: "c", text: "Bạn lọc thông tin về những gì bạn làm sai" },
                { id: "d", text: "Bạn tiếp tục chỉnh sửa, xây dựng lại từ đầu mô hình kinh doanh" }
            ]
        },
        {
            id: 25,
            name: "Các yếu tố nào sau đây cần được mô tả trong phần sản phẩm/dịch vụ (lựa chọn p.a đúng):",
            true_answer: ["a", "c", "d"],
            answers: [
                { id: "a", text: "Chiến lược bao gói" },
                { id: "b", text: "Cấu tạo giá thành sản xuất" },
                { id: "c", text: "Chiến lược phân phối" },
                { id: "d", text: "Chính sách bảo hành hoàn trả" }
            ]
        },
        {
            id: 26,
            name: "Để hình thành nên một ý tưởng kinh doanh (idea generation) hoàn thiện, cần phác thảo đánh giá các ý tưởng… Các yếu tố/thành phần này bao gồm? Lựa chọn tất cả các p.a đúng:",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Đối tượng (subject): Ai là người hưởng lợi từ ý tưởng về sản phẩm, dịch vụ cung cấp" },
                { id: "b", text: "Vấn đề (problem): vấn đề cần giải quyết là gì và việc giải quyết mang lại lợi ích nào" },
                { id: "c", text: "Mô hình kinh doanh (business model)" },
                { id: "d", text: "Báo cáo tài chính (Financial Statement)" }
            ]
        },
        {
            id: 27,
            name: "Khả năng mở rộng (scalability) là gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Doanh nghiệp của bạn tồn tại trên thị trường bao lâu" },
                { id: "b", text: "Làm thế nào để dễ dàng có được khách hàng" },
                { id: "c", text: "Doanh nghiệp của bạn có thể phát triển dễ dàng như thế nào" },
                { id: "d", text: "Doanh nghiệp của bạn có thể phát triển nhanh như thế nào" }
            ]
        },
        {
            id: 28,
            name: "(…) là chỉ số thể hiện khả năng sinh lời, khả năng tăng trưởng doanh thu- lợi nhuận:",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Hệ số biên lợi nhuận gộp (Gross profit margin)" },
                { id: "b", text: "Hệ số biên lợi nhuận ròng (Net profit margin)" },
                { id: "c", text: "Hệ số biên lợi nhuận trước thuế và lãi vay (EBIT Margin)" },
                { id: "d", text: "Hệ số biên lợi nhuận trước thuế (pre-tax profit margin)" }
            ]
        },
        {
            id: 29,
            name: "Kiểu tư duy của người Trung Quốc thường là?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Lạc quan và có khả năng xác định tương lai" },
                { id: "b", text: "Lạc quan và không có khả năng xác định tương lai" },
                { id: "c", text: "Bi quan và có khả năng xác định tương lai" },
                { id: "d", text: "Bi quan và không có khả năng xác định tương lai" }
            ]
        },
        {
            id: 30,
            name: "[…] là chỉ số thể hiện khả năng sinh lời, khả năng tăng trưởng doanh thu - lợi nhuận, năng lực cạnh tranh của doanh nghiệp.",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Hệ số biên lợi nhuận trước thuế và lãi vay (EBIT Margin)" },
                { id: "b", text: "Hệ số biên lợi nhuận gộp (Gross Profit Margin)" },
                { id: "c", text: "Hệ số biên lợi nhuận trước thuế (Pre-Tax Profit Margin)" },
                { id: "d", text: "Hệ số biên lợi nhuận ròng (Net Profit Margin)" }
            ]
        },
        {
            id: 31,
            name: "Để tạo ra sự khác biệt, Các công ty khởi nghiệp đã làm gì để tạo ra các SẢN PHẨM/DỊCH VỤ VƯỢT TRỘI? Lựa chọn TẤT CẢ các phương án đúng.",
            true_answer: ["a", "b", "d"],
            answers: [
                { id: "a", text: "Hệ thống sản phẩm ưu việt hơn" },
                { id: "b", text: "Cung cấp các sản phẩm/dịch vụ tùy chỉnh hơn" },
                { id: "c", text: "Đa dạng hóa sản phẩm" },
                { id: "d", text: "Tập trung vào các công việc có hiệu suất tốt hơn" }
            ]
        },
        {
            id: 32,
            name: "Yếu tố quyết định sự khác nhau giữa thị trường \"đại dương đỏ\" và \"đại dương xanh\" là:",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Chi phí sản xuất" },
                { id: "b", text: "Đối thủ cạnh tranh" },
                { id: "c", text: "Nhà cung cấp" },
                { id: "d", text: "Khách hàng" }
            ]
        },
        {
            id: 33,
            name: "Để hình thành nên 1 ý tưởng kinh doanh (idea generation) hoàn thiện, cần phác thảo đầy đủ các yếu tố/thành phần cấu tạo nên phương trình ý tưởng (idea equation). Các yếu tố/thành phần này bao gồm? Lựa chọn TẤT CẢ các phương án đúng.",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Đối tượng (subject): Ai là người hưởng lợi từ ý tưởng về sản phẩm, dịch vụ cung cấp." },
                { id: "b", text: "Vấn đề (problem): Vấn đề cần giải quyết là gì và việc giải quyết mang lại lợi ích nào?" },
                { id: "c", text: "Mô hình kinh doanh (Business model)" },
                { id: "d", text: "Bản báo cáo tài chính (Financial statement)" }
            ]
        },
        {
            id: 34,
            name: "Phân tích đối thủ cạnh tranh cần phải phân tích những yếu tố gì?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Điểm mạnh và điểm yếu" },
                { id: "b", text: "Chính sách quản lý" },
                { id: "c", text: "Chiến lược giá" },
                { id: "d", text: "Tất cả" }
            ]
        },
        {
            id: 35,
            name: "Các yếu tố nào sau đây cần được mô tả trong phần sản phẩm/dịch vụ (Product/Service) của bản kế hoạch kinh doanh? (Lựa chọn tất cả phương án đúng)",
            true_answer: ["a", "b", "d"],
            answers: [
                { id: "a", text: "Chiến lược bao gói" },
                { id: "b", text: "Cấu tạo giá thành sản xuất" },
                { id: "c", text: "Chiến lược phân phối" },
                { id: "d", text: "Chính sách bảo hành hoàn trả" }
            ]
        },
        {
            id: 36,
            name: "Mô hình kinh doanh mới, đột phá bao gồm? Lựa chọn 3 đáp án",
            true_answer: ["a", "c", "d"],
            answers: [
                { id: "a", text: "Mô hình kinh doanh nền kinh tế chia sẻ" },
                { id: "b", text: "Mô hình kinh doanh đại lý, bán lẻ" },
                { id: "c", text: "Mô hình kinh doanh theo nhu cầu" },
                { id: "d", text: "Mô hình kinh doanh dịch vụ cộng đồng" }
            ]
        },
        {
            id: 37,
            name: "Để xác thực ý tưởng kinh doanh của bạn thông qua phương pháp tưởng tượng khách hàng mục tiêu. Các công cụ giúp bạn tiếp cận nhóm KH này là: Chọn 3 đáp án",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Fb Group" },
                { id: "b", text: "Diễn đàn SubRedduts" },
                { id: "c", text: "Danh sách email (Mailing list)" },
                { id: "d", text: "LinkedIN" }
            ]
        },
        {
            id: 38,
            name: "Học xác thực (validated learning) là gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Học từ trải nghiệm thực tế" },
                { id: "b", text: "Học từ một khóa học trực tuyến" },
                { id: "c", text: "Học bằng cách hỏi người khác về chủ đề" },
                { id: "d", text: "Học bằng nghiên cứu của người khác" }
            ]
        },
        {
            id: 39,
            name: "Ký hiệu “FFF” là viết tắt của gì?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Khả thi, tập trung, nhanh chóng" },
                { id: "b", text: "Bạn bè, người sáng lập và người kết nối" },
                { id: "c", text: "Gia đình, bạn bè và kẻ thù" },
                { id: "d", text: "Bạn bè, gia đình và những kẻ ngu ngốc" }
            ]
        },
        {
            id: 40,
            name: "Loại hình doanh nhân thường thấy trên tin tức báo chí, và công việc kinh doanh của họ mục đích cộng đồng:",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Doanh nhân có phong cách sống" },
                { id: "b", text: "Doanh nhân xã hội" },
                { id: "c", text: "Doanh nhân phụ" },
                { id: "d", text: "Doanh nhân khởi nghiệp" }
            ]
        },
        {
            id: 41,
            name: "Bạn có thể định nghĩa nền kinh tế chia sẻ là như thế nào?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Cách rẻ nhất để mua những gì bạn cần" },
                { id: "b", text: "Cho đi những thứ bạn không dùng nữa" },
                { id: "c", text: "Kiếm tiền từ tài sản mà mọi người thường chia sẻ miễn phí" },
                { id: "d", text: "Tất cả đều sai" }
            ]
        },
        {
            id: 42,
            name: "Bạn có thể tiếp cận vốn đầu tư mạo hiểm (Venture Capital) trong tình huống nào?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Doanh nghiệp của bạn phải có tiềm năng cao và thị trường rộng lớn" },
                { id: "b", text: "Mọi người đều có thể tiếp cận nó" },
                { id: "c", text: "Bạn phải sống ở Mỹ" },
                { id: "d", text: "Sẽ dễ dàng hơn nếu bạn liên hệ trực tiếp với các công ty Venture Capital" }
            ]
        },
        {
            id: 43,
            name: "Một người không thích rủi ro có xu hướng tính toán; xác định tổn thất nếu chấp nhận rủi ro và làm tất cả những gì có thể để tránh mọi rủi ro. Họ có khả năng chịu đựng rủi ro thấp. \"Không thích rủi ro\" nghĩa là gì trong bối cảnh tinh thần kinh doanh?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Một người sẵn sàng chấp nhận rủi ro" },
                { id: "b", text: "Người trốn tránh rủi ro" },
                { id: "c", text: "Tỷ lệ phần trăm rủi ro" },
                { id: "d", text: "Tất cả ý trên" }
            ]
        },
        {
            id: 44,
            name: "Điều đầu tiên một doanh nhân thường làm khi bắt đầu kinh doanh là gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Thu thập tài nguyên" },
                { id: "b", text: "Thuê văn phòng" },
                { id: "c", text: "Nhận ra cơ hội" },
                { id: "d", text: "Hỏi tất cả bạn bè xem ý tưởng của họ có tốt không" }
            ]
        },
        {
            id: 45,
            name: "Có nhiều loại thu nhập khác nhau. Cổ tức là một ví dụ của loại gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Thụ động" },
                { id: "b", text: "Tích cực" },
                { id: "c", text: "Chủ động" },
                { id: "d", text: "Định kỳ" }
            ]
        },
        {
            id: 46,
            name: "Tất cả các doanh nghiệp có bốn giai đoạn riêng biệt. Giai đoạn nào sau đây bao gồm sự suy giảm có thể xảy ra?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Trưởng thành" },
                { id: "b", text: "Lên kế hoạch" },
                { id: "c", text: "Khởi nghiệp" },
                { id: "d", text: "Trước khi ra mắt" }
            ]
        },
        {
            id: 47,
            name: "Các doanh nhân kinh doanh phụ có xu hướng tìm kiếm điều gì khi bắt đầu kinh doanh?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Ít rủi ro" },
                { id: "b", text: "Thêm thu nhập" },
                { id: "c", text: "Ít thời gian cam kết" },
                { id: "d", text: "Tất cả những điều trên" }
            ]
        },
        {
            id: 48,
            name: "Một doanh nhân phong cách sống là gì?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Một người đang tìm cách bắt đầu kinh doanh liên quan đến lối sống lành mạnh" },
                { id: "b", text: "Ai đó đang tìm cách kiếm được một số tiền nhất định để sống một lối sống cụ thể" },
                { id: "c", text: "Một doanh nhân bắt đầu kinh doanh phụ để sống một lối sống cụ thể" },
                { id: "d", text: "Một người muốn có thu nhập cao và chỉ làm việc 40 giờ một tuần" }
            ]
        },
        {
            id: 49,
            name: "Mô hình kinh doanh truyền thống bao gồm? Lựa chọn 2 đáp án",
            true_answer: ["a", "b"],
            answers: [
                { id: "a", text: "Mô hình kinh doanh đại lý bán lẻ (retail business model)" },
                { id: "b", text: "Mô hình nhượng quyền thương mại (franchise business model)" },
                { id: "c", text: "Mô hình kinh doanh theo nhu cầu (Demand business model)" },
                { id: "d", text: "Mô hình kinh doanh nền kinh tế chia sẻ (Sharing economy business model)" }
            ]
        },
        {
            id: 50,
            name: "Bạn sử dụng dịch vụ \"Theo yêu cầu\" như thế nào?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Bạn gọi điện đến công ty và yêu cầu sản phẩm bạn cần" },
                { id: "b", text: "Bạn đến quán và yêu cầu được phục vụ ngay lập tức" },
                { id: "c", text: "Bạn hoàn thành biểu mẫu và nhận mẫu sản phẩm miễn phí" },
                { id: "d", text: "Bạn sử dụng một ứng dụng di động để đặt hàng những gì bạn cần ngay bây giờ" }
            ]
        },
        {
            id: 51,
            name: "\"Khả năng mở rộng\" là gì?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Doanh nghiệp của bạn sẽ tồn tại trên thị trường bao lâu" },
                { id: "b", text: "Doanh nghiệp của bạn có thể phát triển dễ dàng như thế nào" },
                { id: "c", text: "Doanh nghiệp của bạn có thể phát triển nhanh như thế nào" },
                { id: "d", text: "Làm thế nào để dễ dàng để có được khách hàng" }
            ]
        },
        {
            id: 52,
            name: "Loại hình kinh doanh nào quan tâm nhất đến khả năng mở rộng?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Kinh doanh phụ" },
                { id: "b", text: "Kinh doanh phong cách sống" },
                { id: "c", text: "Khởi nghiệp" },
                { id: "d", text: "Tất cả các doanh nghiệp" }
            ]
        },
        {
            id: 53,
            name: "Sự khác biệt giữa nhận một khoản vay và nhận một khoản đầu tư vốn cổ phần là gì?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Không, bạn phải trả lại cả hai" },
                { id: "b", text: "Một khoản đầu tư có thể mang lại cho bạn nhiều tiền hơn một khoản vay" },
                { id: "c", text: "Ai cũng có thể vay dễ dàng" },
                { id: "d", text: "Các khoản vay phải được trả lại, đầu tư không" }
            ]
        },
        {
            id: 54,
            name: "Điều đó có nghĩa là gì khi một sản phẩm có lợi ích tự thể hiện?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Nó rẻ hơn" },
                { id: "b", text: "Bạn có thể tự thiết kế sản phẩm" },
                { id: "c", text: "Mọi người cảm thấy tốt hơn sau khi sử dụng nó" },
                { id: "d", text: "Nó giúp bạn kết nối với những người dùng khác" }
            ]
        },
        {
            id: 55,
            name: "Tim Ferriss nói gì về kinh doanh phong cách sống?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Họ cần nhiều thời gian cam kết và tham gia" },
                { id: "b", text: "Chúng được thiết kế để chỉ đáp ứng nhu cầu tài chính của bạn" },
                { id: "c", text: "Họ là một cách để theo đuổi đam mê của bạn" }
            ]
        },
        {
            id: 56,
            name: "\"Huyền thoại Eureka\" giả định điều gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Ý tưởng kinh doanh là kết quả của một phân tích thị trường chi tiết" },
                { id: "b", text: "Ý tưởng kinh doanh rất dễ tìm kiếm cho mọi người" },
                { id: "c", text: "Ý tưởng kinh doanh chỉ tình cờ xuất hiện trong một khoảnh khắc kỳ diệu" },
                { id: "d", text: "Chỉ những người tài giỏi mới có thể có ý tưởng kinh doanh" }
            ]
        },
        {
            id: 57,
            name: "Khi nào mô hình kinh doanh đăng ký hoạt động tốt nhất?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Khi bạn có nhiều khách hàng" },
                { id: "b", text: "Khi bạn có chi phí gia tăng không đáng kể" },
                { id: "c", text: "Khi bạn chi cung cấp một dịch vụ" }
            ]
        },
        {
            id: 58,
            name: "Lợi thế của mô hình kinh doanh \"Trực tiếp đến người tiêu dùng\" là gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Phí vận chuyển thấp hơn" },
                { id: "b", text: "Chất lượng sản phẩm cao hơn" },
                { id: "c", text: "Bỏ qua các nhà bán lẻ" },
                { id: "d", text: "Bạn có thể nhận sản phẩm ngay lập tức" }
            ]
        },
        {
            id: 59,
            name: "Ý tưởng kinh doanh nảy sinh dựa trên việc nhận diện những giá trị phù hợp giữa hai khía cạnh Kỹ năng và Sở thích tạo thành ý tưởng kinh doanh này là gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Ý tưởng kinh doanh dựa trên lợi ích (Benefit based business)" },
                { id: "b", text: "Tưởng tượng về tương lai (Image the future)" },
                { id: "c", text: "Ý tưởng kinh doanh dựa trên sự phù hợp (The fit generator)" },
                { id: "d", text: "Ý tưởng kinh doanh dựa trên vấn đề (Problem based business ideas)" }
            ]
        },
        {
            id: 60,
            name: "Mô hình kinh doanh là gì?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Tập hợp các chiến lược bạn sử dụng để tìm kiếm khách hàng" },
                { id: "b", text: "Cách bạn kiếm tiền dựa trên những gì bạn đang bán" },
                { id: "c", text: "Kế hoạch chi tiết về cách tiếp cận các cơ hội kinh doanh" },
                { id: "d", text: "Các phương pháp sử dụng để quảng bá sản phẩm, dịch vụ của mình" }
            ]
        },

        // đã sửa 60 câu

        {
            id: 61,
            name: "Những yếu tố cấu thành thuộc mô hình kinh doanh. 3 đáp án",
            true_answer: ["a", "c", "d"],
            answers: [
                { id: "a", text: "Giá trị cung cấp" },
                { id: "b", text: "Sơ đồ tổ chức" },
                { id: "c", text: "Các kênh phân phối" },
                { id: "d", text: "Các hoạt động chính" }
            ]
        },
        {
            id: 62,
            name: "Để hình thành nên 1 ý tưởng kinh doanh (Idea Generation) hoàn thiện, cần phác thảo equation). Các yếu tố/thành phần này bao gồm? Chọn 3 đáp án",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Đối tượng (subject) Ai là người được hưởng lợi từ ý tưởng về SP, dịch vụ cung cấp" },
                { id: "b", text: "Vấn đề (Problem) Vấn đề cần giải quyết là gì và việc giải quyết mang lại lợi ích gì?" },
                { id: "c", text: "Mô hình kinh doanh (Business Model)" },
                { id: "d", text: "Bản báo cáo tài chính (Financial Statement)" }
            ]
        },
        {
            id: 63,
            name: `Nguyên lý hoạt động của phương pháp này là: <br>1. Bạn xây dựng một doanh nghiệp tinh gọn dựa trên một <br>2. Bạn đo lường phản ứng của khách hàng khi tiếp cận doanh nghiệp <br>3. Bạn lọc thông tin về những gì bạn làm sai <br>4. Bạn tiếp tục chỉnh sửa, xây dựng lại từ đầu mô hình kinh doanh. <br> <br>Phương pháp xác thực ý tưởng kinh doanh này được gọi là gì?`,
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Bản khảo sát (Survey)" },
                { id: "b", text: "Thử nghiệm giả tưởng (Pitch experiments)" },
                { id: "c", text: "Trao đổi với chuyên gia (Talking to experts)" },
                { id: "d", text: "Khung khởi nghiệp tinh gọn (The lean startup framework)" }
            ]
        },
        {
            id: 64,
            name: "Các kênh phân phối tiêu biểu gồm:",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Đại lý truyền thống" },
                { id: "b", text: "Đến tận nơi hoặc trong cửa hàng" },
                { id: "c", text: "Phân phối qua Internet" },
                { id: "d", text: "Cả 3 phương án trên" }
            ]
        },
        {
            id: 65,
            name: "Ông Peter Thiel là ai?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Nhà đầu tư đầu tiên của Google" },
                { id: "b", text: "Founder của Facebook" },
                { id: "c", text: "Đồng sáng lập và Giám đốc điều hành của Paypal" },
                { id: "d", text: "Giám đốc điều hành của Google" }
            ]
        },
        {
            id: 66,
            name: "Cho biết lợi ích khi sử dụng Google Alert trong nghiên cứu khách hàng hoặc ngành hàng kinh doanh?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Theo dõi xu hướng người dùng" },
                { id: "b", text: "Theo dõi hoạt động tin tức của các đối tác lớn, đối tác tiềm năng" },
                { id: "c", text: "Cả A, B đều đúng" },
                { id: "d", text: "Cả A, B đều sai" }
            ]
        },
        {
            id: 67,
            name: "Vai trò của các đối tác chính?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Mạng lưới mang lại hiệu quả kinh doanh" },
                { id: "b", text: "Tối ưu hoá chi phí" },
                { id: "c", text: "Chia sẻ hạ tầng" },
                { id: "d", text: "Cả 3 phương án trên" }
            ]
        },
        {
            id: 68,
            name: "Các website hỗ trợ bạn làm bản khảo sát (survey) bao gồm?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "SurveyMonkey" },
                { id: "b", text: "Weber" },
                { id: "c", text: "Google Forms" },
                { id: "d", text: "Tất cả các phương án đều đúng" }
            ]
        },
        {
            id: 69,
            name: "Các yếu tố cơ bản cần được xác định trước khi viết kế hoạch kinh doanh là gì? (Lựa chọn tất cả phương án đúng)",
            true_answer: ["a", "b", "d"],
            answers: [
                { id: "a", text: "Người đọc bản kế hoạch kinh doanh" },
                { id: "b", text: "Khách hàng mục tiêu" },
                { id: "c", text: "Loại hình pháp lý doanh nghiệp" },
                { id: "d", text: "Yếu tố sở hữu trí tuệ: bản quyền, bằng sáng chế, nhãn hiệu" }
            ]
        },
        {
            id: 70,
            name: "Phương pháp để xác định ý tưởng kinh doanh này là:",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Bản khảo sát (survey)" },
                { id: "b", text: "Thử nghiệm giả tưởng (pitch experiments)" },
                { id: "c", text: "Trao đổi với chuyên gia (talking to experts)" },
                { id: "d", text: "Khung khởi nghiệp tinh gọn (The lean start-up framework)" }
            ]
        },
        {
            id: 71,
            name: "Loại đổi mới nào có thể giúp doanh nghiệp giảm những phức tạp không muốn",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Đổi mới giá cả" },
                { id: "b", text: "Đổi mới chất lượng" },
                { id: "c", text: "Đổi mới sự tiện lợi" },
                { id: "d", text: "Đổi mới tốc độ" }
            ]
        },
        {
            id: 72,
            name: "Yếu tố nào sau đây cho phép các công ty nhỏ hoạt động như những công ty lớn?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Phát triển kinh tế" },
                { id: "b", text: "Cạnh tranh" },
                { id: "c", text: "Khách hàng" },
                { id: "d", text: "Công nghệ" }
            ]
        },
        {
            id: 73,
            name: "Mô tả chính xác nhất về \"Xác thực ý tưởng\" là gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Bạn hỏi một vài người bạn xem họ nghĩ gì về ý tưởng của bạn" },
                { id: "b", text: "Bạn nói với người khác ý tưởng của bạn tuyệt vời như thế nào và họ đồng ý" },
                { id: "c", text: "Bạn thử nghiệm ý tưởng của mình để xem có bao nhiêu người quan tâm" },
                { id: "d", text: "Bạn ra mắt sản phẩm của mình và chạy một chiến dịch quảng cáo rầm rộ" }
            ]
        },
        {
            id: 74,
            name: "Google Trends là gì?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Công cụ giúp người dùng phân tích đối thủ cạnh tranh chi tiết trên Google" },
                { id: "b", text: "Công cụ giúp người dùng nắm bắt các nội dung, từ khóa đang được nhiều truy cập trong khoảng thời gian cụ thể" },
                { id: "c", text: "Công cụ giúp người dùng phát hiện spam trên trang web của mình thời gian cụ thể" },
                { id: "d", text: "Tất cả phương án đều đúng" }
            ]
        },
        {
            id: 75,
            name: "Hầu hết các doanh nhân đều có cái mà chúng tôi gọi là “chấp nhận rủi ro” tỷ lệ doanh nghiệp khởi nghiệp thành công là bao nhiêu?",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "15%" },
                { id: "b", text: "5%" },
                { id: "c", text: "10%" },
                { id: "d", text: "20%" }
            ]
        },
        {
            id: 76,
            name: "Để tạo ra sự khác biệt. Các công ty khởi nghiệp đã làm gì để tạo ra những cải tiến. Chọn TẤT CẢ phương án đúng",
            true_answer: ["a", "b", "d"],
            answers: [
                { id: "a", text: "Hệ thống sản phẩm ưu việt hơn" },
                { id: "b", text: "Cung cấp các sản phẩm/dịch vụ tùy chỉnh hơn" },
                { id: "c", text: "Đa dạng hóa sản phẩm" },
                { id: "d", text: "Tập trung vào các công việc có hiệu suất tốt hơn" }
            ]
        },
        {
            id: 77,
            name: "Nhóm người nào sau đây có thể cân kế hoạch kinh doanh",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Ngân hàng" },
                { id: "b", text: "Nhà đầu tư" },
                { id: "c", text: "Cố vấn" },
                { id: "d", text: "Tất cả các ý trên" }
            ]
        },
        {
            id: 78,
            name: "Khả năng thực thi là gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Bộ kỹ năng cụ thể bạn trong doanh nghiệp" },
                { id: "b", text: "Khả năng đưa ra những ý tưởng tuyệt vời" },
                { id: "c", text: "Năng lực theo đuổi thực thi ý tưởng kinh doanh" },
                { id: "d", text: "Tất cả phương án trên đều sai" }
            ]
        },
        {
            id: 79,
            name: "Cho biết lợi ích khi sử dụng Google Alert trong nghiên cứu khách hàng",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Theo dõi xu hướng người dùng" },
                { id: "b", text: "Theo dõi hoạt động tin tức của các đối tác lớn, đối tác tiềm năng" },
                { id: "c", text: "Cả A, B đều đúng" },
                { id: "d", text: "Cả A, B đều sai" }
            ]
        },
        {
            id: 80,
            name: "Các kênh phân phối tiêu biểu gồm:",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Đại lý truyền thống" },
                { id: "b", text: "Đến tận nơi hoặc trong cửa hàng" },
                { id: "c", text: "Phân phối qua internet" },
                { id: "d", text: "Cả 3 phương án trên" }
            ]
        },
        {
            id: 81,
            name: "Rủi ro trong kinh doanh đến từ yếu tố kinh tế vĩ mô, NGOẠI TRỪ:",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Sự suy thoái nền kinh tế" },
                { id: "b", text: "Thảm họa, hòa hoạn tại trụ sở doanh nghiệp" },
                { id: "c", text: "Thảm họa thiên tai, dịch bệnh" },
                { id: "d", text: "Sự thay đổi thể chế chính trị" }
            ]
        },
        {
            id: 82,
            name: "Ông Peter Thiel là ai?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Nhà đầu tư đầu tiên trên Google" },
                { id: "b", text: "Giám đốc điều hành Google" },
                { id: "c", text: "Đồng sáng lập và GĐ điều hành của Paypal" },
                { id: "d", text: "Founder của Facebook" }
            ]
        },
        {
            id: 83,
            name: "[...] là chỉ số thể hiện sự chênh lệch giữa doanh thu và các chi phí trong các hoạt động kinh doanh",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Chi phí" },
                { id: "b", text: "Lợi nhuận" },
                { id: "c", text: "Giá bán" },
                { id: "d", text: "Doanh thu" }
            ]
        },
        {
            id: 84,
            name: "MVP có nghĩa là gì?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Số tiền tối thiểu bạn có thể bán được từ 1 sản phẩm" },
                { id: "b", text: "Số lượng khách hàng tối thiểu bạn cần để duy trì HĐKD của doanh nghiệp" },
                { id: "c", text: "Số lượng tối thiểu các phiên bản của sản phẩm mà bạn có thể dùng để" },
                { id: "d", text: "Tiêu chí tối thiểu để thành công" }
            ]
        },
        {
            id: 85,
            name: "Khả năng mở rộng (Scalability) là gì?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Doanh nghiệp của bạn sẽ TỒN TẠI TRÊN THỊ TRƯỜNG bao lâu" },
                { id: "b", text: "Làm thế nào để dễ dàng CÓ ĐƯỢC KHÁCH HÀNG" },
                { id: "c", text: "Doanh nghiệp của bạn có thể PHÁT TRIỂN DỄ DÀNG như thế nào" },
                { id: "d", text: "Doanh nghiệp của bạn có thể PHÁT TRIỂN NHANH như thế nào" }
            ]
        },
        {
            id: 86,
            name: "Doanh nhân có xu hướng hoạt động xã hội tương tự như tổ chức nào sau đây?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Tổ chức từ thiện" },
                { id: "b", text: "Các nhà từ thiện" },
                { id: "c", text: "Người gây quỹ" },
                { id: "d", text: "Các tổ chức phi lợi nhuận" }
            ]
        },
        {
            id: 87,
            name: "[..] là chỉ số thể hiện khả năng sinh lời, khả năng tăng trưởng doanh thu - lợi nhuận của DN",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Hệ số biên lợi nhuận gộp (Gross Profit Margin)" },
                { id: "b", text: "Hệ số biên lợi nhuận ròng (Net Profit Margin)" },
                { id: "c", text: "Hệ số biên lợi nhuận trước thuế và lãi vay (EBIT Margin)" },
                { id: "d", text: "Hệ số biên lợi nhuận trước thuế (Pre-Tax Profit Margin)" }
            ]
        },
        {
            id: 88,
            name: "Các yếu tố nào sau đây cần được mô tả trong phần SP/DV (Chọn 3)",
            true_answer: ["a", "b", "d"],
            answers: [
                { id: "a", text: "Chiến lược bao gói" },
                { id: "b", text: "Cấu tạo giá thành sản xuất" },
                { id: "c", text: "Chiến lược phân phối" },
                { id: "d", text: "Chính sách bảo hành hoàn trả" }
            ]
        },
        {
            id: 89,
            name: "Yếu tố quyết định sự khác nhau giữa thị trường \"đại dương đỏ\" và \"đại dương xanh\" là",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Đối thủ cạnh tranh" },
                { id: "b", text: "Chi phí sản xuất" },
                { id: "c", text: "Nhà cung cấp" },
                { id: "d", text: "Khách hàng" }
            ]
        },
        {
            id: 90,
            name: "Cách tốt nhất để tiếp cận các nhà đầu tư thiên thần (Angles) là gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Nói với họ rằng bạn đang tìm kiếm lời khuyên của người cố vấn quản lý" },
                { id: "b", text: "Gọi cho họ và yêu cầu trả tiền trước" },
                { id: "c", text: "Viết cho họ một email nói lý do tại sao ý tưởng của bạn là tuyệt vời" },
                { id: "d", text: "Gặp họ trực tiếp và phàn nàn về tình hình tài chính của bạn" }
            ]
        },
        {
            id: 91,
            name: "Các hình thức vốn có thể huy động cho khởi nghiệp bao gồm. Chọn 3 đáp án",
            true_answer: ["a", "c", "d"],
            answers: [
                { id: "a", text: "Vốn riêng khởi nghiệp (Bootstrapping)" },
                { id: "b", text: "Vốn cổ phần (Equity)" },
                { id: "c", text: "Vốn đầu tư mạo hiểm (Venture Capital)" },
                { id: "d", text: "Vốn vay (Loans)" }
            ]
        },
        {
            id: 92,
            name: "Google, Facebook là những ví dụ về",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Phong cách sống" },
                { id: "b", text: "Mức sống" },
                { id: "c", text: "Tiêu chuẩn công nghiệp" },
                { id: "d", text: "Công ty khởi nghiệp" }
            ]
        },
        {
            id: 93,
            name: "Ý tưởng kinh doanh này sinh dựa trên việc chúng ta tưởng tượng chúng ta là một công ty lớn mới thành lập sẽ phục vụ những nhu cầu đó. Kỹ thuật này là",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Ý tưởng kinh doanh dựa trên vấn đề" },
                { id: "b", text: "Ý tưởng kinh doanh dựa trên lợi ích" },
                { id: "c", text: "Trí tưởng tượng đảo ngược" },
                { id: "d", text: "Tưởng tượng về tương lai" }
            ]
        },
        {
            id: 94,
            name: "Kiểu tư duy của người Trung Quốc thường là",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Bi quan và không có khả năng xác định tương lai" },
                { id: "b", text: "Bi quan và có khả năng xác định tương lai" },
                { id: "c", text: "Lạc quan và có khả năng xác định tương lai" },
                { id: "d", text: "Lạc quan và không có khả năng xác định tương lai" }
            ]
        },
        {
            id: 95,
            name: "Đâu là loại hình mới quan hệ khách hàng chưa phổ biến tại Việt Nam",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "QHKH qua tương tác trả lời tự động" },
                { id: "b", text: "QHKH dựa trên tương tác trực tiếp cá nhân" },
                { id: "c", text: "Quan hệ khách hàng qua mail" },
                { id: "d", text: "QHKH dựa trên người dùng xây dựng hệ sinh thái tương tác" }
            ]
        },
        {
            id: 96,
            name: "Dòng doanh thu từ mô hình doanh thu của DN KHÔNG bao gồm",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Phí môi giới" },
                { id: "b", text: "Cho thuê" },
                { id: "c", text: "Quảng cáo truyền miệng" },
                { id: "d", text: "Phí đăng ký dài hạn" }
            ]
        },
        {
            id: 97,
            name: "Doanh nhân thường có kiểu tư duy nào",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Lạc quan và không có khả năng xác định tương lai" },
                { id: "b", text: "Bi quan và có khả năng xác định tương lai" },
                { id: "c", text: "Bi quan và không có khả năng xác định tương lai" },
                { id: "d", text: "Lạc quan và có khả năng xác định tương lai" }
            ]
        },
        {
            id: 98,
            name: "Mô tả chính xác nhất về \"xác thực ý tưởng\" là gì?",
            true_answer: ["a"],
            answers: [
                { id: "a", text: "Bạn thử nghiệm ý tưởng của mình để xem có bao nhiêu người quan tâm" },
                { id: "b", text: "Bạn hỏi 1 vài người bạn xem họ nghĩ gì về ý tưởng của bạn" },
                { id: "c", text: "Bạn nói với người khác ý tưởng của bạn tuyệt vời như thế nào và họ đồng ý" },
                { id: "d", text: "Bạn ra mắt sản phẩm của mình và chạy 1 chiến dịch quảng cáo rầm rộ" }
            ]
        },
        {
            id: 99,
            name: "Theo lời khuyên của chuyên gia, bản kế hoạch kinh doanh nên phân tích bao nhiêu yếu tố",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "6" },
                { id: "b", text: "4" },
                { id: "c", text: "3" },
                { id: "d", text: "5" }
            ]
        },
        {
            id: 100,
            name: "Một thỏa thuận kinh doanh trong đó một bên cho phép một bên khác sử dụng thương hiệu của mình",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Doanh nghiệp tư nhân" },
                { id: "b", text: "Hợp tác xã" },
                { id: "c", text: "Công ty trách nhiệm hữu hạn" },
                { id: "d", text: "Nhượng quyền thương mại" }
            ]
        },
        {
            id: 101,
            name: "Vai trò của các đối tác chính?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Mạng lưới mang lại hiệu quả kinh doanh" },
                { id: "b", text: "Tối ưu hóa chi phí" },
                { id: "c", text: "Chia sẻ hạ tầng" },
                { id: "d", text: "Cả 3 phương án trên" }
            ]
        },
        {
            id: 102,
            name: "Giá trị mà doanh nghiệp bạn cung cấp cho khách hàng trả lời các câu hỏi nào sau đây?",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Lý do tại sao KH của bạn trả tiền cho SP của bạn" },
                { id: "b", text: "SP của bạn mang lại cho họ điều gì" },
                { id: "c", text: "Làm sao để xuất giá trị SP của doanh nghiệp bạn nổi bật hơn của đối thủ cạnh tranh" },
                { id: "d", text: "Cả 3 đáp án trên" }
            ]
        },
        {
            id: 103,
            name: "Chìa khóa của các ngành công nghiệp cung cấp SP/DV tăng hiệu suất hơn là",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Con người" },
                { id: "b", text: "Khoa học, công nghệ" },
                { id: "c", text: "Mối quan hệ chiến lược" },
                { id: "d", text: "Tăng trưởng thị trường" }
            ]
        },
        {
            id: 104,
            name: "… là các yếu tố làm ngắn cản các đối thủ cạnh tranh tiềm năng tham gia vào thị trường và cạnh tranh với công ty của bạn",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Chi phí đầu tư" },
                { id: "b", text: "Rào cản nhập ngành" },
                { id: "c", text: "Hiệu ứng nền kinh tế" },
                { id: "d", text: "Khách hàng và thị trường" }
            ]
        },
        {
            id: 105,
            name: "Chức năng của kênh phân phối bao gồm. Lựa chọn 3 đáp án",
            true_answer: ["b", "c", "d"],
            answers: [
                { id: "a", text: "Giúp xây dựng nhận biết về dịch vụ hay SP" },
                { id: "b", text: "Tạo điều kiện để khách hàng mua hàng" },
                { id: "c", text: "Đảm bảo sự hài lòng của khách hàng sau khi mua hàng thông qua những hỗ trợ" },
                { id: "d", text: "Tạo mối quan hệ với các đối tác" }
            ]
        },
        {
            id: 106,
            name: "Điều gì có thể được coi là một sự đổi mới về giá?",
            true_answer: ["c"],
            answers: [
                { id: "a", text: "Cung cấp cùng một sản phẩm với giá cao hơn" },
                { id: "b", text: "Cung cấp cùng một sản phẩm với giá thấp hơn" },
                { id: "c", text: "Cả hai đúng" },
                { id: "d", text: "Cả hai sai" }
            ]
        },
        {
            id: 107,
            name: "Nội dung trình bày trong phần các mốc thành tựu (milestones) của DN",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Sứ mệnh, tầm nhìn của DN" },
                { id: "b", text: "Mục đích, mục tiêu, thành tựu đạt được trong quá khứ và hiện tại của DN." },
                { id: "c", text: "Chiến lược kinh doanh đã thực hiện trong quá khứ và hiện tại" },
                { id: "d", text: "Chiến lược kinh doanh trong tương lai" }
            ]
        },
        {
            id: 108,
            name: "… là tài liệu phản ánh/tổng quát tình hình và kết quả kinh doanh trong một kỳ hoạt động của DN",
            true_answer: ["b"],
            answers: [
                { id: "a", text: "Bảng cân đối kế toán (balance sheet)" },
                { id: "b", text: "Báo cáo kết quả kinh doanh (Income Statement)" },
                { id: "c", text: "Báo cáo lưu chuyển tiền tệ (Cash flow statement)" },
                { id: "d", text: "Báo cáo kết quả bán hàng" }
            ]
        },
        {
            id: 109,
            name: "Các yếu tố sau đây cần được mô tả trong phần sản phẩm, dịch vụ (Product/Service)",
            true_answer: ["b", "c", "d"],
            answers: [
                { id: "a", text: "Chiến lược truyền thông cho SP/DV" },
                { id: "b", text: "Đặc tính của SP/DV" },
                { id: "c", text: "Cách thức sản xuất/cung cấp SP/DV" },
                { id: "d", text: "Kiểm soát chất lượng SP/DV" }
            ]
        },
        {
            id: 110,
            name: "Để xác định đối tượng khách hàng mục tiêu và mô tả được chi tiết đối tượng thì chúng ta cần làm gì",
            true_answer: ["a", "b", "c"],
            answers: [
                { id: "a", text: "Tìm kiếm các dữ liệu khách hàng có sẵn" },
                { id: "b", text: "Phân khúc khách hàng" },
                { id: "c", text: "Thực hiện cuộc nghiên cứu khảo sát khách hàng" },
                { id: "d", text: "Phân tích tính hấp dẫn của ngành hàng" }
            ]
        },
        {
            id: 111,
            name: "Đâu là ví dụ cho SP có sự lỗi thời có tính toán (planned obsolescence)",
            true_answer: ["d"],
            answers: [
                { id: "a", text: "Điện thoại thông minh" },
                { id: "b", text: "Dao cạo một lần" },
                { id: "c", text: "Hệ thống định vị" },
                { id: "d", text: "Tất cả các ví dụ trên" }
            ]
        }
    ];

    if (id === null) {
        return questions;
    }
    return questions.find(q => q.id === id);
}
