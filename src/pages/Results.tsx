import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { Download, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentResult {
  studentId: string;
  totalScore: number;
  totalQuestions: number;
  percentage: number;
}

const Results = () => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load results from localStorage
    const savedResults = localStorage.getItem('evaluationResults');
    if (savedResults) {
      const evaluationData = JSON.parse(savedResults);
      
      // Aggregate by student
      const studentMap = new Map<string, { total: number; count: number }>();
      
      evaluationData.forEach((answer: any) => {
        const existing = studentMap.get(answer.studentId) || { total: 0, count: 0 };
        studentMap.set(answer.studentId, {
          total: existing.total + answer.score,
          count: existing.count + 1,
        });
      });

      const aggregated: StudentResult[] = Array.from(studentMap.entries()).map(([studentId, data]) => ({
        studentId,
        totalScore: data.total,
        totalQuestions: data.count,
        percentage: (data.total / data.count) * 100,
      }));

      setResults(aggregated.sort((a, b) => b.percentage - a.percentage));
    }
  }, []);

  const downloadCSV = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results available to download.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Student ID', 'Total Score', 'Total Questions', 'Percentage'].join(','),
      ...results.map(r => 
        [r.studentId, r.totalScore, r.totalQuestions, r.percentage.toFixed(2)].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluation-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Results exported to CSV successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Evaluation Results
          </h1>
          <p className="text-muted-foreground mb-8">
            Final scores and statistics for all students
          </p>

          <div className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Students</CardDescription>
                  <CardTitle className="text-3xl">{results.length}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Average Score</CardDescription>
                  <CardTitle className="text-3xl">
                    {results.length > 0 
                      ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1) 
                      : 0}%
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Highest Score</CardDescription>
                  <CardTitle className="text-3xl">
                    {results.length > 0 ? results[0].percentage.toFixed(1) : 0}%
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Scores</CardTitle>
                    <CardDescription>Ranked by performance</CardDescription>
                  </div>
                  <Button onClick={downloadCSV} variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No results available yet.</p>
                    <p className="text-sm mt-2">Complete the evaluation process first.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Total Questions</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result, index) => (
                          <TableRow key={result.studentId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{result.studentId}</TableCell>
                            <TableCell>{result.totalScore}</TableCell>
                            <TableCell>{result.totalQuestions}</TableCell>
                            <TableCell>
                              <span className={`font-semibold ${
                                result.percentage >= 80 ? 'text-green-600' :
                                result.percentage >= 60 ? 'text-yellow-600' :
                                'text-destructive'
                              }`}>
                                {result.percentage.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
