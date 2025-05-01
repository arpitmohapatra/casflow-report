import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatProps {
  reportType: 'AP' | 'GL';
  year: number;
  month: number;
}

const Chat: React.FC<ChatProps> = ({ reportType, year, month }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I can help you analyze the ${reportType} cash flow data for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}. What would you like to know?`,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In production, this would call the actual backend API
      // For local development, we'll simulate a response
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let response = '';
        if (input.toLowerCase().includes('summary')) {
          response = `The ${reportType} cash flow for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year} shows a total inflow of $245,678.90 and outflow of $198,456.78, resulting in a net positive flow of $47,222.12.`;
        } else if (input.toLowerCase().includes('largest')) {
          response = `The largest transaction in the ${reportType} report for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year} was $34,500.00 for equipment purchase on ${new Date(year, month - 1, 15).toLocaleDateString()}.`;
        } else if (input.toLowerCase().includes('compare')) {
          response = `Compared to the previous month, the ${reportType} cash flow for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year} shows a 12% increase in total volume and a 5% increase in net position.`;
        } else {
          response = `I've analyzed the ${reportType} cash flow data for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}. The data shows healthy financial activity with balanced inflows and outflows. Is there something specific you'd like to know about this period?`;
        }
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // In production, call the actual API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: input,
            reportType,
            year,
            month
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get response from assistant');
        }
        
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-muted/30">
        <h2 className="text-xl font-semibold">Cash Flow Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about your {reportType} cash flow for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your cash flow..."
            className="flex-1 rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 