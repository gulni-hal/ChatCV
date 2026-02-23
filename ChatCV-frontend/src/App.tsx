import { useState, useRef, useEffect } from "react";
import "./App.css";
import logo from "./assets/vite.svg";

interface Message {
  sender: "user" | "bot";
  text: string;
}

function App() {
  const [question, setQuestion] = useState("");
  // const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi! I'm an AI chatbot specifically designed to answer questions about Turkish Musiki history. Are you ready to start?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(true); // Sayfa açıldığında açık başlar

  // Yeni mesaj geldiğinde otomatik aşağı kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const sendQuestion = async (overrideQuestion?: string) => {
    const currentQuestion = overrideQuestion || question;
    if (!currentQuestion.trim()) return;

    const userMessage: Message = { sender: "user", text: currentQuestion };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          chat_history: [], // İleride buraya gerçek geçmişi ekleyebilirsin
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        sender: "bot",
        text: data.answer || "Hata oluştu.",
      };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Sunucuya bağlanılamadı." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const SUGGESTED_QUESTIONS = [
    "who inspired the Turkish Musiki?",
    "Osmanlı dönemi müzik eğitimi nasıldı?",
    "PDF'e göre önemli bestekarlar kimlerdir?",
    "Geleneksel Türk müziği türleri nelerdir?",
    "Geleneksel Türk müziği türleri nelerdir?",
  ];
  const handleQuickSearch = async (query: string) => {
    setQuestion(query);
    // Not: setQuestion asenkron olduğu için sendQuestion içinde 'question'
    // hala boş olabilir. Bu yüzden sendQuestion'ı parametre alacak şekilde
    // hafifçe düzenlemek veya useEffect kullanmak gerekebilir.
    // En basit yol: sendQuestion'ı mevcut question state'i ile tetiklemek.
  };

  return (
    <div className="chat-page">
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)} // Dışarı tıklandığında kapat
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // İçeri tıklandığında olayın dışarı yayılmasını engelle
          >
            <h2>Welcome to My Personalized Chatbot!</h2>
            <p>
              Hi! My name is Gülnihal Eruslu, and I'm a student in Information
              Systems Engineering.
            </p>
            <p>
              {" "}
              I built this RAG-based chatbot to help you get to know me better.
              You can ask questions about my education, projects, and
              experience. To learn more about this project or my other projects,
              check out my GitHub profile!
            </p>
            <div className="modal-links">
              <a
                href="https://github.com/gulni-hal"
                target="_blank"
                rel="noopener noreferrer"
                className="github-button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                &nbsp; View on GitHub
              </a>
            </div>
            <p>
              For the best results, please use English. However, you can also
              use Turkish if you prefer.
            </p>
            <p>
              To get started quickly, you can choose from the suggested
              questions!
            </p>

            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              Let's Start!
            </button>
          </div>
        </div>
      )}
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-left-group">
            <img src={logo} alt="Logo" className="chat-logo" />
            <h1>Chat CV</h1>
          </div>
        </header>
        <div className="messages-container">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble bot typing">Thinking...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* {chatHistory.length === 0 && (  */}
        {/* // Sadece sohbet başlamamışken gösterir */}
        <div className="suggestions-container">
          {SUGGESTED_QUESTIONS
            // Eğer soru chatHistory içinde daha önce sorulmuşsa onu listeden çıkar
            .filter(
              (q) =>
                !chatHistory.some(
                  (msg) => msg.sender === "user" && msg.text === q,
                ),
            )
            .map((q, index) => (
              <button
                key={index}
                className="suggestion-card"
                onClick={() => sendQuestion(q)}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
        </div>
        {/* )} */}
        <div className="input-area">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
            placeholder="Ask your questions!"
          />
          <button onClick={sendQuestion} disabled={isLoading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
