import torch
import torch.optim as optim
from model import GPTLanguageModel, batch_size, block_size, device
from data_prep import get_data, get_batch

# hyperparameters
max_iters = 1000  # keep low for limited compute
eval_interval = 200
eval_iters = 50
learning_rate = 1e-3

@torch.no_grad()
def estimate_loss(model, train_data, val_data):
    out = {}
    model.eval()
    for split, data in [('train', train_data), ('val', val_data)]:
        losses = torch.zeros(eval_iters)
        for k in range(eval_iters):
            X, Y = get_batch(data, block_size, batch_size, device)
            logits, loss = model(X, Y)
            losses[k] = loss.item()
        out[split] = losses.mean()
    model.train()
    return out

def run_training():
    print("Loading data...")
    train_data, val_data, vocab_size, _, _ = get_data("data.pdf")
    
    print(f"Vocab size: {vocab_size}")
    model = GPTLanguageModel(vocab_size)
    model = model.to(device)
    
    # print the number of parameters in the model
    print(sum(p.numel() for p in model.parameters())/1e6, 'M parameters')

    optimizer = optim.AdamW(model.parameters(), lr=learning_rate)

    print("Starting training on device:", device)
    for iter in range(max_iters):
        if iter % eval_interval == 0 or iter == max_iters - 1:
            losses = estimate_loss(model, train_data, val_data)
            print(f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")

        xb, yb = get_batch(train_data, block_size, batch_size, device)
        logits, loss = model(xb, yb)
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        optimizer.step()

    print("Training finished. Saving model...")
    torch.save(model.state_dict(), "model.pth")
    print("Model saved to model.pth")
    return "Training complete!"

if __name__ == "__main__":
    run_training()
