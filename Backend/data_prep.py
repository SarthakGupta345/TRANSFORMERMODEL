import torch
import PyPDF2
import os
import json

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def get_data(pdf_path="data.pdf", val_split=0.1):
    if not os.path.exists(pdf_path):
        # Fallback to dummy text if PDF is missing
        text = "This is a fallback text because the PDF was not found. " * 100
    else:
        text = extract_text_from_pdf(pdf_path)
    
    chars = sorted(list(set(text)))
    vocab_size = len(chars)
    
    # Save the mapping so we can decode later during inference
    mapping = {
        "chars": chars,
        "vocab_size": vocab_size
    }
    with open("meta.json", "w") as f:
        json.dump(mapping, f)

    # create a mapping from characters to integers
    stoi = { ch:i for i,ch in enumerate(chars) }
    itos = { i:ch for i,ch in enumerate(chars) }
    encode = lambda s: [stoi[c] for c in s] # encoder: take a string, output a list of integers
    decode = lambda l: ''.join([itos[i] for i in l]) # decoder: take a list of integers, output a string

    data = torch.tensor(encode(text), dtype=torch.long)
    
    n = int((1 - val_split) * len(data))
    train_data = data[:n]
    val_data = data[n:]
    
    return train_data, val_data, vocab_size, encode, decode

def get_batch(data, block_size, batch_size, device):
    ix = torch.randint(len(data) - block_size, (batch_size,))
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    x, y = x.to(device), y.to(device)
    return x, y
