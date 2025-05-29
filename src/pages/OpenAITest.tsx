import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const OpenAITest = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('http://localhost:8000/openai_test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to get response');
      }

      const result = await res.json();
      setResponse(result.response);
      
      toast({
        title: "Success",
        description: "OpenAI API responded successfully!",
      });

    } catch (error: any) {
      console.error("Error calling OpenAI API:", error);
      toast({
        title: "Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">OpenAI API Test</CardTitle>
              <p className="text-center text-gray-600">Test the OpenAI integration with simple text messages</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your message:
                </label>
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  onKeyDown={e => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  disabled={isLoading}
                />
              </div>
              
              {response && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI Response:
                  </label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="whitespace-pre-wrap text-gray-800">{response}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="h-4 w-4 ml-2"/>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OpenAITest;