from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
from query import get_answer
from initialize import initialize_qa_system
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # initialize message
    print("Initializing QA system...")
    app.state.qa_chain = initialize_qa_system()
    print("QA system initialized successfully!")
    yield
    # shutdown message
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    question: str
    answer: str

class QueryRequest(BaseModel):
    question: str
    chat_history: Optional[List[ChatMessage]] = []

@app.post("/query")
async def query_endpoint(request: QueryRequest):
    # Convert chat history to the format expected by get_answer
    chat_history = [
        {"question": msg.question, "answer": msg.answer}
        for msg in (request.chat_history or [])
    ]

    try:
        answer = get_answer(request.question, chat_history, app.state.qa_chain)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}