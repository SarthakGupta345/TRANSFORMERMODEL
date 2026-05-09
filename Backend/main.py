from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import json
import os
import shutil
from model import GPTLanguageModel, device
from train import run_training

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str
    max_tokens: int = 100

class ChatResponse(BaseModel):
    response: str

# Global variable to hold the loaded model
loaded_model = None
encode_fn = None
decode_fn = None
is_training = False

def load_model_if_needed():
    global loaded_model, encode_fn, decode_fn
    if loaded_model is not None:
        return
    
    if not os.path.exists("model.pth") or not os.path.exists("meta.json"):
        return # Cannot load yet
        
    with open("meta.json", "r") as f:
        meta = json.load(f)
        
    chars = meta["chars"]
    vocab_size = meta["vocab_size"]
    
    stoi = { ch:i for i,ch in enumerate(chars) }
    itos = { i:ch for i,ch in enumerate(chars) }
    
    encode_fn = lambda s: [stoi.get(c, 0) for c in s]
    decode_fn = lambda l: ''.join([itos.get(i, '') for i in l])
    
    model = GPTLanguageModel(vocab_size)
    model.load_state_dict(torch.load("model.pth", map_location=device))
    model.to(device)
    model.eval()
    
    loaded_model = model
    print("Model loaded successfully!")

@app.on_event("startup")
async def startup_event():
    load_model_if_needed()

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Uploads a PDF file to be used as training data."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
        
    with open("data.pdf", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"message": f"Successfully uploaded {file.filename}"}

def background_train_task():
    global is_training
    is_training = True
    try:
        run_training()
    except Exception as e:
        print(f"Training error: {e}")
    finally:
        is_training = False
        # Reload the newly trained model weights
        global loaded_model
        loaded_model = None 
        load_model_if_needed()

@app.get("/status")
async def get_status():
    return {"is_training": is_training}

@app.post("/train")
async def train_model(background_tasks: BackgroundTasks):
    """Triggers the training process in the background."""
    global is_training
    if is_training:
        return {"message": "Training is already in progress."}
        
    if not os.path.exists("data.pdf"):
        raise HTTPException(status_code=400, detail="No PDF found. Please upload one first.")
        
    background_tasks.add_task(background_train_task)
    return {"message": "Training started in the background. Check server logs for progress."}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generates text from the model given a prompt."""
    load_model_if_needed()
    if loaded_model is None:
        raise HTTPException(status_code=500, detail="Model is not trained yet. Call /train first.")
        
    context = torch.tensor((encode_fn(request.prompt),), dtype=torch.long, device=device)
    
    generated_indices = loaded_model.generate(context, max_new_tokens=request.max_tokens)
    generated_text = decode_fn(generated_indices[0].tolist())
    
    return ChatResponse(response=generated_text)
