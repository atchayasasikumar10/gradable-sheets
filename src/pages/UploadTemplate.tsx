import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Upload, Square, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnswerRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  questionNumber: number;
}

const UploadTemplate = () => {
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [regions, setRegions] = useState<AnswerRegion[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateImage(event.target?.result as string);
        setRegions([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!templateImage) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDrawing(true);
      setStartPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      
      const newRegion: AnswerRegion = {
        id: Date.now().toString(),
        x: Math.min(startPoint.x, endX),
        y: Math.min(startPoint.y, endY),
        width: Math.abs(endX - startPoint.x),
        height: Math.abs(endY - startPoint.y),
        questionNumber: regions.length + 1,
      };
      
      setRegions([...regions, newRegion]);
    }
    setIsDrawing(false);
    setStartPoint(null);
  };

  const deleteRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
  };

  const saveTemplate = () => {
    if (!templateImage || regions.length === 0) {
      toast({
        title: "Cannot Save",
        description: "Please upload a template and mark at least one answer region.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate OCR extraction of correct answers from template
    const answerKey: Record<string, string> = {};
    const mockTemplateAnswers = [
      'Delhi', 
      'Mahatma Gandhi', 
      'Photosynthesis',
      'Mitochondria',
      'India',
    ];
    
    regions.forEach((region) => {
      // In real app, this would run OCR on the region
      answerKey[`Q${region.questionNumber}`] = mockTemplateAnswers[region.questionNumber - 1] || 'Sample Answer';
    });
    
    // Save template, regions, and extracted answer key
    localStorage.setItem('template', JSON.stringify({ 
      image: templateImage, 
      regions 
    }));
    localStorage.setItem('answerKey', JSON.stringify(answerKey));
    
    toast({
      title: "Template & Answer Key Saved",
      description: `Extracted ${regions.length} answers automatically using OCR.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Upload Question Paper Template
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload your question paper template and mark the regions where students will write their answers.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Template Image</CardTitle>
                <CardDescription>
                  {templateImage ? "Click and drag to mark answer regions" : "Upload a question paper template"}
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
                  <div 
                    ref={canvasRef}
                    className="relative cursor-crosshair border-2 border-border rounded-lg overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                  >
                    <img src={templateImage} alt="Template" className="w-full" />
                    {regions.map((region) => (
                      <div
                        key={region.id}
                        className="absolute border-2 border-primary bg-primary/20"
                        style={{
                          left: region.x,
                          top: region.y,
                          width: region.width,
                          height: region.height,
                        }}
                      >
                        <span className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                          Q{region.questionNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Square className="h-5 w-5" />
                    Answer Regions
                  </CardTitle>
                  <CardDescription>
                    Marked: {regions.length} regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {regions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No regions marked yet</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {regions.map((region) => (
                        <div key={region.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-medium">Question {region.questionNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRegion(region.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>1. Upload your question paper template</p>
                  <p>2. Click and drag to draw rectangles around answer areas</p>
                  <p>3. Each rectangle will be numbered automatically</p>
                  <p>4. Save the template to proceed</p>
                </CardContent>
              </Card>

              <Button onClick={saveTemplate} className="w-full" size="lg">
                <Save className="mr-2 h-5 w-5" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTemplate;
