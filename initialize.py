from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from dotenv import load_dotenv
import os


def initialize_qa_system():
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY")

    # Absolute path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(current_dir, "assets", "musikihistory.pdf")

    # Load PDF
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    # Split text
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )
    docs = splitter.split_documents(pages)

    # Embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectordb = Chroma.from_documents(docs, embedding=embeddings)
    retriever = vectordb.as_retriever()

    # Prompt
    TEMPLATE = """
You are a legal assistant for music history in Turkey.
Always answer only using the PDF context below.

- Answers must be 80-100 words, direct, never fabricated.
- If answer not in PDF, reply: "I don't know"
- Never make up context.

Context:
{context}

Question: {question}
Answer:
"""

    prompt = PromptTemplate.from_template(TEMPLATE)

    # LLM
    llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2
    )

    # LCEL chain (Modern RAG)
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain
