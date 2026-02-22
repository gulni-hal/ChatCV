import { useState, useRef, useEffect } from "react";
import "./App.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <div className="chat-container">
        <header className="chat-header">
          <h1>Chat CV</h1>
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
            placeholder="Ask your question!"
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
