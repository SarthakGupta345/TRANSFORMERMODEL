'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowUp, Paperclip, Globe, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [value, setValue] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/status');
        if (res.ok) {
          const data = await res.json();
          setIsTraining(data.is_training);
          if (!data.is_training && uploadStatus === 'training') {
            setUploadStatus('complete');
            setTimeout(() => setUploadStatus(null), 3000);
          }
        }
      } catch {
        // Backend not running — fail silently
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [uploadStatus]);

  const handleSend = () => {
    if (value.trim() && !disabled && !isTraining) {
      onSendMessage(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload the file
      let res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      
      setUploadStatus('training');
      setIsTraining(true);

      // 2. Trigger training
      res = await fetch('http://localhost:8000/train', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Training failed to start');
      
    } catch (error) {
      console.error(error);
      setUploadStatus(null);
      setIsTraining(false);
      alert('Error uploading file or starting training. Make sure the backend server is running.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-0 left-[260px] right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-8 px-4 z-20">
      <div className="chat-container-max-width relative">
        {/* Training Status Banner */}
        {(isTraining || uploadStatus) && (
          <div className="mb-3 animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 bg-input-bg border border-border-subtle rounded-2xl">
              <Loader2 size={16} className={isTraining ? "text-emerald-400 animate-spin" : "text-emerald-400"} />
              <span className="text-sm text-gray-300">
                {uploadStatus === 'uploading' && '📤 Uploading PDF...'}
                {uploadStatus === 'training' && '🧠 Training model on your document... This may take a few minutes.'}
                {uploadStatus === 'complete' && '✅ Training complete! You can now chat with the model.'}
                {isTraining && !uploadStatus && '🧠 Model is training... Please wait.'}
              </span>
            </div>
          </div>
        )}

        <div className="bg-input-bg border border-border-subtle rounded-[28px] p-2 flex items-end gap-2 shadow-lg focus-within:ring-1 focus-within:ring-gray-600 transition-all">
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <button 
            className="p-2.5 rounded-full hover:bg-background transition-all text-gray-500 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isTraining}
            title="Upload PDF for training"
          >
            <Paperclip size={22} />
          </button>
          
          <textarea
            placeholder={isTraining ? "Model is training... please wait" : "Message AI Assistant..."}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isTraining}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-1 text-[15px] max-h-[200px] min-h-[48px] outline-none text-foreground placeholder:text-gray-500 disabled:opacity-50"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />

          <div className="flex items-center gap-1.5 p-1">
             <button className="p-2 rounded-full hover:bg-background transition-all text-gray-500">
              <Globe size={22} />
            </button>
            <button 
              className="w-9 h-9 bg-white text-black rounded-full hover:opacity-90 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
              onClick={handleSend}
              disabled={disabled || isTraining || !value.trim()}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
        
        <p className="text-[11px] text-center text-gray-500 mt-4 font-medium tracking-wide">
          AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}

export default ChatInput
