from langchain_ollama import ChatOllama, OllamaEmbeddings

router_llm = ChatOllama(model="gemma3:27b-cloud")
answer_llm = ChatOllama(model="gemma3:27b-cloud")
embeddings = OllamaEmbeddings(model="embeddinggemma:latest")