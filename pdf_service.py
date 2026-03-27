import tempfile, os
from langchain_community.document_loaders import PyPDFLoader
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from vectorstore import all_docs, reset_vectorstore


def process_pdf(file, embeddings):
    all_docs.clear()
    vectorstore = reset_vectorstore(embeddings)

    tmp_path = None
    chunks = []
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file)
            tmp_path = tmp.name

        loader = PyPDFLoader(tmp_path)
        documents = loader.load()

        for doc in documents:
            doc.metadata["file_name"] = "uploaded_file"

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150
        )

        chunks = splitter.split_documents(documents)
        all_docs.extend(chunks)
        vectorstore.add_documents(chunks)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    return len(chunks), len(all_docs)