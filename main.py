from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, qa, ask_modes, ppt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(qa.router)
app.include_router(ask_modes.router)
app.include_router(ppt.router)