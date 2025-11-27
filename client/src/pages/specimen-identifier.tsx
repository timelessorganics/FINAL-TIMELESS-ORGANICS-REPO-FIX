
import { useState } from "react";
import { Upload, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface IdentificationResult {
  species: string;
  commonName: string;
  castingSuitability: "excellent" | "good" | "moderate" | "poor";
  suitabilityReason: string;
  estimatedPrice: number;
  recommendedStyle: string;
  seasonalNotes: string;
}

export default function SpecimenIdentifier() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/specimen/identify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to identify specimen. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "moderate": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case "excellent":
      case "good":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <section className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-bronze/20 rounded-full text-bronze text-sm font-bold mb-4">
              AI-POWERED IDENTIFICATION
            </div>
            <h1 className="font-serif text-5xl font-bold mb-4">
              <span className="moving-fill">Specimen</span> Identification Tool
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your botanical specimen and our AI will identify the species,
              assess casting suitability, and provide an instant quote.
            </p>
          </section>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Specimen Photo
              </CardTitle>
              <CardDescription>
                Clear photo showing the full specimen for best results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-bronze/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="specimen-upload"
                />
                <label htmlFor="specimen-upload" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Specimen preview"
                        className="max-h-96 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground mb-1">
                          Click to upload specimen photo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {selectedFile && !result && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full btn-bronze"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Specimen...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Identify & Get Quote
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-card/50 border-bronze/30">
              <CardHeader>
                <CardTitle className="text-bronze">Identification Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Species</p>
                    <p className="text-xl font-serif font-bold">{result.species}</p>
                    <p className="text-sm text-muted-foreground italic">{result.commonName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Casting Suitability</p>
                    <div className="flex items-center gap-2">
                      {getSuitabilityIcon(result.castingSuitability)}
                      <p className={`text-xl font-bold capitalize ${getSuitabilityColor(result.castingSuitability)}`}>
                        {result.castingSuitability}
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>{result.suitabilityReason}</AlertDescription>
                </Alert>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recommended Style</p>
                    <p className="text-lg font-medium">{result.recommendedStyle}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Quote</p>
                    <p className="text-3xl font-bold text-bronze">
                      R{(result.estimatedPrice / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Final quote depends on specimen size and complexity
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Seasonal Notes</p>
                    <p className="text-sm">{result.seasonalNotes}</p>
                  </div>
                </div>

                {(result.castingSuitability === "excellent" || result.castingSuitability === "good") && (
                  <Button className="w-full btn-bronze" size="lg" asChild>
                    <a href="/commission">Request Custom Casting</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Alert className="mt-8">
            <Sparkles className="w-4 h-4" />
            <AlertDescription>
              <strong>How it works:</strong> Our AI analyzes your photo using botanical databases
              and casting experience data. Results are estimates—David will provide final approval
              and pricing after reviewing the actual specimen.
            </AlertDescription>
          </Alert>
        </div>
      </main>
      <Footer />
    </>
  );
}
