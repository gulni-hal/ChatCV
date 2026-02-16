from typing import List, Dict, Optional

def get_answer(question: str, chat_history: Optional[List[Dict[str, str]]] = None, qa_chain = None):
    """
    Get answer for a legal query with chat history context

    Args:
        question (str): The question to ask
        chat_history (List[Dict[str, str]], optional): List of previous QA pairs
            Each dict should have 'question' and 'answer' keys
        qa_chain: The initialized QA chain (should be passed from app state)

    Returns:
        str: The answer to the question
    """
    if qa_chain is None:
        raise ValueError("QA chain not initialized.")

    # Chat history formatla
    history_context = ""
    if chat_history:
        history_context = "\n".join([
            f"Previous Q: {qa['question']}\nPrevious A: {qa['answer']}"
            for qa in chat_history[-3:]
        ])

    # Eğer history varsa soruya ekle
    if history_context:
        full_question = f"{history_context}\n\nCurrent question: {question}"
    else:
        full_question = question

    # Modern LCEL çağrısı
    result = qa_chain.invoke(full_question)

    return result