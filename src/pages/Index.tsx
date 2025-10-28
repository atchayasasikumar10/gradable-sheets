import { Link } from "react-router-dom";
import { FileText, Upload, CheckCircle, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Automated Answer Sheet Evaluation
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Upload question paper templates and student answer sheets. Our AI-powered system automatically aligns, extracts, and evaluates answers with precision.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/upload-template">
                <Button size="lg" className="gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Template
                </Button>
              </Link>
              <Link to="/upload-sheets">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Answer Sheets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mb-4">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Upload Template</h3>
                <p className="text-muted-foreground">
                  Upload your question paper template and mark answer regions where students will write their responses.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mb-4">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Upload Sheets</h3>
                <p className="text-muted-foreground">
                  Bulk upload scanned student answer sheets. Our system automatically aligns and corrects any rotation or skew.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Auto Evaluation</h3>
                <p className="text-muted-foreground">
                  OCR extracts handwritten answers and compares them with the answer key using fuzzy matching algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mb-4">
                  <BarChart className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">4. View Results</h3>
                <p className="text-muted-foreground">
                  Get detailed results with marks per student, question-wise breakdown, and export to CSV for further analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-primary text-primary-foreground border-0">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Save hours of manual grading time. Start evaluating answer sheets automatically with high accuracy.
              </p>
              <Link to="/upload-template">
                <Button size="lg" variant="secondary" className="gap-2">
                  <FileText className="h-5 w-5" />
                  Start Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
