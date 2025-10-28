import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { Play, CheckCircle, XCircle, FileCheck } from "lucide-react";
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load answer key automatically from template
    const storedAnswerKey = localStorage.getItem('answerKey');
    if (storedAnswerKey) {
      const parsedKey = JSON.parse(storedAnswerKey);
      setAnswerKey(parsedKey);
      setIsLoaded(true);
    } else {
      toast({
        title: "No Answer Key Found",
        description: "Please upload and save a question paper template first.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
            Answer Extraction & Evaluation
          </h1>
          <p className="text-muted-foreground mb-8">
            Provide the correct answers and run automatic evaluation using OCR and fuzzy matching.
          </p>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Answer Key Status
                </CardTitle>
                <CardDescription>
                  Automatically extracted from Question Paper Template using OCR
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoaded ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500">
                        ✓ Answer Key Loaded
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(answerKey).length} questions detected
                      </span>
                    </div>
                    
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h4 className="text-sm font-medium mb-3">Extracted Answers:</h4>
                      <div className="grid gap-2">
                        {Object.entries(answerKey).map(([qKey, answer]) => (
                          <div key={qKey} className="flex justify-between text-sm">
                            <span className="font-medium">{qKey}:</span>
                            <span className="text-muted-foreground">{answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No answer key found. Please upload a template first.</p>
                  </div>
                )}
                
                <Button 
                  onClick={runEvaluation} 
                  disabled={isEvaluating || !isLoaded}
                  className="w-full mt-6"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {isEvaluating ? "Evaluating All Answer Sheets..." : "Evaluate All Answer Sheets"}
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
