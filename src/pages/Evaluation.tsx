import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { Play, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Answer {
  studentId: string;
  questionNo: number;
  extractedAnswer: string;
  correctAnswer: string;
  score: number;
  isCorrect: boolean;
}

const Evaluation = () => {
  const [answerKey, setAnswerKey] = useState<Record<number, string>>({});
  const [evaluationResults, setEvaluationResults] = useState<Answer[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnswerKeyChange = (questionNo: number, answer: string) => {
    setAnswerKey({ ...answerKey, [questionNo]: answer });
  };

  const runEvaluation = () => {
    if (Object.keys(answerKey).length === 0) {
      toast({
        title: "No Answer Key",
        description: "Please provide answers for at least one question.",
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
        Object.keys(answerKey).forEach((qNo) => {
          const questionNo = parseInt(qNo);
          const correctAnswer = answerKey[questionNo].toLowerCase().trim();
          const extractedAnswer = mockExtractedAnswers[studentIndex][questionNo - 1] || '';
          
          // Simple fuzzy matching simulation
          const similarity = extractedAnswer.toLowerCase().includes(correctAnswer) || 
                           correctAnswer.includes(extractedAnswer.toLowerCase()) ? 90 : 40;
          
          const isCorrect = similarity > 80;
          
          mockResults.push({
            studentId,
            questionNo,
            extractedAnswer,
            correctAnswer: answerKey[questionNo],
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
                <CardTitle>Answer Key</CardTitle>
                <CardDescription>
                  Enter the correct answers for each question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((qNo) => (
                    <div key={qNo}>
                      <Label htmlFor={`q${qNo}`}>Question {qNo}</Label>
                      <Input
                        id={`q${qNo}`}
                        placeholder="Enter correct answer"
                        value={answerKey[qNo] || ''}
                        onChange={(e) => handleAnswerKeyChange(qNo, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={runEvaluation} 
                  disabled={isEvaluating}
                  className="w-full mt-6"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {isEvaluating ? "Evaluating..." : "Run Evaluation"}
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
