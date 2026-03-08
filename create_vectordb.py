from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

pdf_path = "assets/deneme7SON.pdf"

loader = PyPDFLoader(pdf_path)
pages = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150
)

docs = splitter.split_documents(pages)

embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
        
    )

vectordb = Chroma.from_documents(
    docs,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

vectordb.persist()

print("Chroma DB oluşturuldu.")