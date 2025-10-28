import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Play, CheckCircle, XCircle, FileCheck, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Answer {
  studentId: string;
  questionNo: number;
  extractedAnswer: string;
  correctAnswer: string;
  score: number;
  isCorrect: boolean;
}

const Evaluation = () => {
  const [answerKey, setAnswerKey] = useState<Record<string, string>>({});
  const [evaluationResults, setEvaluationResults] = useState<Answer[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessingAnswerKey, setIsProcessingAnswerKey] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load questions from template
    const storedTemplate = localStorage.getItem('template');
    if (storedTemplate) {
      const template = JSON.parse(storedTemplate);
      if (template.questions) {
        const key: Record<string, string> = {};
        Object.entries(template.questions).forEach(([qId, qData]: [string, any]) => {
          key[qId] = qData.expected_answer;
        });
        setAnswerKey(key);
        setIsLoaded(true);
      }
    } else {
      toast({
        title: "No Question Paper Found",
        description: "Please upload and save a question paper first.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleAnswerKeyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingAnswerKey(true);
      
      // Simulate OCR processing of answer key file
      setTimeout(() => {
        const updatedKey: Record<string, string> = {
          Q1: "New Delhi",
          Q2: "Mahatma Gandhi",
          Q3: "Photosynthesis",
          Q4: "Mitochondria",
          Q5: "India",
        };
        
        setAnswerKey(updatedKey);
        setIsProcessingAnswerKey(false);
        
        toast({
          title: "Answer Key Updated",
          description: "Answer key has been extracted from the uploaded file.",
        });
      }, 2000);
    }
  };

  const runEvaluation = () => {
    if (Object.keys(answerKey).length === 0) {
      toast({
        title: "No Answer Key",
        description: "Please upload a question paper template first.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);

    // Simulate OCR extraction and evaluation
    setTimeout(() => {
      const mockResults: Answer[] = [];
      const students = ['STU001', 'STU002', 'STU003'];
      const mockExtractedAnswers = [
        ['Delhi', 'Mahatma Gandhi', 'Photosynthesis'],
        ['New Delhi', 'Gandhi', 'Photosyntheis'],
        ['delhi', 'M Gandhi', 'Photosynthesis'],
      ];

      students.forEach((studentId, studentIndex) => {
        Object.keys(answerKey).forEach((qKey) => {
          const questionNo = parseInt(qKey.replace('Q', ''));
          const correctAnswer = answerKey[qKey].toLowerCase().trim();
          const extractedAnswer = mockExtractedAnswers[studentIndex][questionNo - 1] || '';
          
          // Fuzzy matching simulation (normalize and compare)
          const normalizedExtracted = extractedAnswer.toLowerCase().replace(/[^\w]/g, '');
          const normalizedCorrect = correctAnswer.toLowerCase().replace(/[^\w]/g, '');
          
          const similarity = normalizedExtracted.includes(normalizedCorrect) || 
                           normalizedCorrect.includes(normalizedExtracted) ? 90 : 40;
          
          const isCorrect = similarity >= 80;
          
          mockResults.push({
            studentId,
            questionNo,
            extractedAnswer,
            correctAnswer: answerKey[qKey],
            score: isCorrect ? 1 : 0,
            isCorrect,
          });
        });
      });

      setEvaluationResults(mockResults);
      setIsEvaluating(false);
      
      // Save results to localStorage for Results page
      localStorage.setItem('evaluationResults', JSON.stringify(mockResults));
      
      toast({
        title: "Evaluation Complete",
        description: `Evaluated ${mockResults.length} answers across ${students.length} students.`,
      });
    }, 3000);
  };

  const viewResults = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Auto Evaluation
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload an answer key (optional) or use AI-generated answers, then run automatic evaluation.
          </p>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Answer Key
                </CardTitle>
                <CardDescription>
                  AI-generated answers from question paper (optional: upload custom answer key)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoaded ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500">
                        ✓ Answer Key Ready
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(answerKey).length} questions
                      </span>
                    </div>
                    
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h4 className="text-sm font-medium mb-3">Current Answers:</h4>
                      <div className="grid gap-2">
                        {Object.entries(answerKey).map(([qKey, answer]) => (
                          <div key={qKey} className="flex justify-between text-sm">
                            <span className="font-medium">{qKey}:</span>
                            <span className="text-muted-foreground">{answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Label htmlFor="answer-key-upload" className="text-sm font-medium mb-2 block">
                        Upload Custom Answer Key (Optional)
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="answer-key-upload" className="cursor-pointer">
                          <span className="text-sm text-primary font-medium">Upload PDF or Text file</span>
                          <Input
                            id="answer-key-upload"
                            type="file"
                            accept=".pdf,.txt"
                            className="hidden"
                            onChange={handleAnswerKeyUpload}
                            disabled={isProcessingAnswerKey}
                          />
                        </Label>
                        {isProcessingAnswerKey && (
                          <p className="text-xs text-muted-foreground mt-2">Processing answer key...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No question paper found. Please upload one first.</p>
                  </div>
                )}
                
                <Button 
                  onClick={runEvaluation} 
                  disabled={isEvaluating || !isLoaded || isProcessingAnswerKey}
                  className="w-full mt-6"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {isEvaluating ? "Running Auto Evaluation..." : "Run Auto Evaluation"}
                </Button>
              </CardContent>
            </Card>

            {evaluationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Results</CardTitle>
                  <CardDescription>
                    Extracted answers compared with answer key
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Question No</TableHead>
                          <TableHead>Extracted Answer</TableHead>
                          <TableHead>Correct Answer</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluationResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{result.studentId}</TableCell>
                            <TableCell>{result.questionNo}</TableCell>
                            <TableCell>{result.extractedAnswer}</TableCell>
                            <TableCell>{result.correctAnswer}</TableCell>
                            <TableCell>{result.score}</TableCell>
                            <TableCell>
                              {result.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Button onClick={viewResults} className="w-full mt-6" size="lg">
                    View Complete Results
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
