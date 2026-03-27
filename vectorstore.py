import os
import shutil
from langchain_chroma import Chroma

PERSIST_DIR = "chroma_store"
vectorstore = None
all_docs = []


def reset_vectorstore(embeddings):
    global vectorstore
    # Delete persisted data so the new store starts clean
    if os.path.exists(PERSIST_DIR):
        shutil.rmtree(PERSIST_DIR)
    vectorstore = Chroma(embedding_function=embeddings, persist_directory=PERSIST_DIR)
    return vectorstore


def get_vectorstore(embeddings):
    global vectorstore
    if vectorstore is None:
        vectorstore = Chroma(embedding_function=embeddings, persist_directory=PERSIST_DIR)
    return vectorstore