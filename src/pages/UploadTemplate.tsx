import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Upload, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  text: string;
  expected_answer: string;
}

const UploadTemplate = () => {
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateImage(event.target?.result as string);
        setIsProcessing(true);
        
        // Simulate automatic OCR + layout detection
        setTimeout(() => {
          const detectedQuestions: Question[] = [
            { id: "Q1", text: "What is the capital of India?", expected_answer: "Delhi" },
            { id: "Q2", text: "Who is known as the Father of the Nation?", expected_answer: "Mahatma Gandhi" },
            { id: "Q3", text: "What is the process by which plants make food?", expected_answer: "Photosynthesis" },
            { id: "Q4", text: "What is the powerhouse of the cell?", expected_answer: "Mitochondria" },
            { id: "Q5", text: "In which country is the Taj Mahal located?", expected_answer: "India" },
          ];
          
          setQuestions(detectedQuestions);
          setIsProcessing(false);
          
          toast({
            title: "Questions Detected",
            description: `Automatically detected ${detectedQuestions.length} questions using OCR.`,
          });
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveTemplate = () => {
    if (!templateImage || questions.length === 0) {
      toast({
        title: "Cannot Save",
        description: "Please upload a question paper to detect questions.",
        variant: "destructive",
      });
      return;
    }
    
    // Save question structure with detected text and expected answers
    const questionStructure: Record<string, { text: string; expected_answer: string }> = {};
    questions.forEach((q) => {
      questionStructure[q.id] = {
        text: q.text,
        expected_answer: q.expected_answer,
      };
    });
    
    // Save template and question structure
    localStorage.setItem('template', JSON.stringify({ 
      image: templateImage, 
      questions: questionStructure 
    }));
    
    toast({
      title: "Question Paper Saved",
      description: `Detected and saved ${questions.length} questions with expected answers.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Upload Question Paper
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload your question paper and we'll automatically detect all questions and answer regions using OCR.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Question Paper</CardTitle>
                <CardDescription>
                  {templateImage ? (isProcessing ? "Processing with OCR..." : `Detected ${questions.length} questions`) : "Upload a question paper"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!templateImage ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="template-upload" className="cursor-pointer">
                      <span className="text-primary font-medium">Click to upload</span> or drag and drop
                      <Input
                        id="template-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                ) : (
                  <div className="relative border-2 border-border rounded-lg overflow-hidden">
                    <img src={templateImage} alt="Question Paper" className="w-full" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-sm text-muted-foreground">Detecting questions...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detected Questions
                  </CardTitle>
                  <CardDescription>
                    {questions.length} questions detected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No questions detected yet</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {questions.map((question) => (
                        <div key={question.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-bold text-primary">{question.id}</span>
                          </div>
                          <p className="text-sm mb-2">{question.text}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">Expected:</span>
                            <span className="bg-background px-2 py-1 rounded">{question.expected_answer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How it works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>1. Upload your question paper image</p>
                  <p>2. OCR automatically detects questions and answer regions</p>
                  <p>3. Expected answers are generated using AI</p>
                  <p>4. Save and proceed to upload answer sheets</p>
                </CardContent>
              </Card>

              <Button onClick={saveTemplate} className="w-full" size="lg" disabled={questions.length === 0 || isProcessing}>
                <Save className="mr-2 h-5 w-5" />
                Save Question Paper
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTemplate;
