import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-2');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey || !userInput) return;

    setIsLoading(true);
    const newMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, newMessage]);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...chatHistory, newMessage],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching the response.');
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Claude AI Interface</h1>
      <div className="mb-4">
        <Input
          type="password"
          placeholder="Enter your Anthropic API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mb-2"
        />
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select Claude version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-2">Claude 2</SelectItem>
            <SelectItem value="claude-instant-1">Claude Instant 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4 h-[400px] overflow-y-auto border p-4 rounded">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Type your message here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button type="submit" disabled={isLoading || !apiKey}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default Index;
