import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const sendQuestion = async () => {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();
    setAnswer(data.answer);
  };

  return (
    <div>
      <h1>Chatbot</h1>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} />
      <button onClick={sendQuestion}>Send</button>

      <p>{answer}</p>
    </div>
  );
}

export default App;
