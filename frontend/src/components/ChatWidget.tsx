import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatWidgetProps {
  onGenerateReport: (reportType: 'AP' | 'GL', year: number, month: number) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onGenerateReport }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I can help you analyze cash flow data or generate reports. For example, try asking "Generate AP report for January 2023" or "Show me GL data for March 2024".`,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

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
      // Check if it's a request to generate a report
      const reportMatch = input.match(/generate\s+(ap|gl)\s+report\s+for\s+(\w+)\s+(\d{4})/i);
      
      if (reportMatch) {
        const reportType = reportMatch[1].toUpperCase() as 'AP' | 'GL';
        const monthName = reportMatch[2];
        const year = parseInt(reportMatch[3]);
        
        // Convert month name to number
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                         'july', 'august', 'september', 'october', 'november', 'december'];
        const month = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase()) + 1;
        
        if (month > 0) {
          // Generate response message
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `Generating ${reportType} report for ${monthName} ${year}...`,
            sender: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Call the generate report function
          onGenerateReport(reportType, year, month);
          
          // Add follow-up message
          setTimeout(() => {
            const followupMessage: Message = {
              id: (Date.now() + 2).toString(),
              content: `The ${reportType} report for ${monthName} ${year} is now displayed on the main screen.`,
              sender: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, followupMessage]);
          }, 1000);
          
          setIsLoading(false);
          return;
        }
      }
      
      // For other messages, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = '';
      if (input.toLowerCase().includes('help')) {
        response = `I can help you in the following ways:
1. Generate reports by typing "Generate AP report for January 2023"
2. Answer questions about cash flow data
3. Provide financial insights

What would you like to do?`;
      } else if (input.toLowerCase().includes('summary') || input.toLowerCase().includes('analyze')) {
        response = `I can provide a summary of cash flow data once you've generated a report. Try asking "Generate AP report for January 2023" first.`;
      } else {
        response = `I'm not sure how to help with that specific request. You can ask me to generate reports by typing something like "Generate AP report for January 2023" or "Generate GL report for March 2024".`;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className={`bg-card rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out mb-2 border ${
            isMinimized ? 'w-72 h-12' : 'w-80 sm:w-96 max-h-[calc(100vh-6rem)]'
          }`}
        >
          <div className="p-3 bg-primary text-primary-foreground flex justify-between items-center">
            <h3 className="font-medium">Cash Flow Assistant</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMinimize}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="flex flex-col h-[calc(100%-3rem)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-12rem)]">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      
      {!isOpen && (
        <Button 
          onClick={toggleChat} 
          size="icon" 
          className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget; 