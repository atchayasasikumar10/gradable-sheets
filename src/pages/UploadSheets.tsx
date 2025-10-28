import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedSheet {
  id: string;
  name: string;
  originalImage: string;
  alignedImage: string | null;
  alignmentAccuracy: number;
  status: 'pending' | 'processing' | 'aligned' | 'error';
}

const UploadSheets = () => {
  const [sheets, setSheets] = useState<UploadedSheet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const newSheets: UploadedSheet[] = await Promise.all(
      files.map(async (file) => {
        const reader = new FileReader();
        return new Promise<UploadedSheet>((resolve) => {
          reader.onload = (event) => {
            resolve({
              id: Date.now().toString() + Math.random(),
              name: file.name,
              originalImage: event.target?.result as string,
              alignedImage: null,
              alignmentAccuracy: 0,
              status: 'pending',
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setSheets([...sheets, ...newSheets]);
    toast({
      title: "Sheets Uploaded",
      description: `${files.length} answer sheet(s) uploaded successfully.`,
    });
  };

  const processAlignment = () => {
    setIsProcessing(true);
    
    // Simulate alignment process
    sheets.forEach((sheet, index) => {
      setTimeout(() => {
        setSheets(prevSheets => 
          prevSheets.map(s => 
            s.id === sheet.id 
              ? { 
                  ...s, 
                  status: 'processing' as const,
                  alignmentAccuracy: 0 
                } 
              : s
          )
        );

        // Simulate alignment completion
        setTimeout(() => {
          setSheets(prevSheets => 
            prevSheets.map(s => 
              s.id === sheet.id 
                ? { 
                    ...s, 
                    status: 'aligned' as const,
                    alignedImage: s.originalImage, // In real app, this would be the aligned version
                    alignmentAccuracy: 85 + Math.random() * 12 // Random accuracy between 85-97%
                  } 
                : s
            )
          );
        }, 2000);
      }, index * 500);
    });

    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Alignment Complete",
        description: "All sheets have been aligned successfully.",
      });
    }, sheets.length * 500 + 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Upload Student Answer Sheets
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload scanned answer sheets. The system will automatically align and correct any rotation or skew.
          </p>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Answer Sheets</CardTitle>
                <CardDescription>
                  Select multiple images of student answer sheets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="sheets-upload" className="cursor-pointer">
                    <span className="text-primary font-medium">Click to upload</span> or drag and drop
                    <Input
                      id="sheets-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFilesUpload}
                    />
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Uploaded: {sheets.length} sheet(s)
                  </p>
                </div>

                {sheets.length > 0 && (
                  <Button 
                    onClick={processAlignment} 
                    disabled={isProcessing}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {isProcessing ? "Processing..." : "Process Alignment"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {sheets.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {sheets.map((sheet) => (
                  <Card key={sheet.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        {sheet.status === 'aligned' && <FileCheck className="h-4 w-4 text-green-500" />}
                        {sheet.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                        {sheet.name}
                      </CardTitle>
                      <CardDescription>
                        Status: <span className="capitalize font-medium">{sheet.status}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Original</p>
                            <img 
                              src={sheet.originalImage} 
                              alt="Original" 
                              className="w-full border border-border rounded"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Aligned</p>
                            {sheet.alignedImage ? (
                              <img 
                                src={sheet.alignedImage} 
                                alt="Aligned" 
                                className="w-full border border-border rounded"
                              />
                            ) : (
                              <div className="w-full aspect-[3/4] border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground">
                                Pending
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {sheet.status === 'aligned' && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Alignment Accuracy</span>
                              <span className="font-medium">{sheet.alignmentAccuracy.toFixed(1)}%</span>
                            </div>
                            <Progress value={sheet.alignmentAccuracy} className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSheets;
