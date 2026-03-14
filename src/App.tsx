/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  ArrowRight,
  Loader2,
  RefreshCw,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type CaptionTone = 'professional' | 'storytelling' | 'minimalist' | 'technical';

interface GeneratedCaption {
  id: string;
  text: string;
  tone: CaptionTone;
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [detectedStyle, setDetectedStyle] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setBase64Image(result.split(',')[1]);
        setCaptions([]); // Clear previous captions
        setDetectedStyle(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCaptions = async () => {
    if (!base64Image) return;

    setIsAnalyzing(true);
    try {
      const prompt = `
        Analyze this architecture image and:
        1. Identify the specific architectural style (e.g., Brutalist, Art Deco, Modern, Gothic, Contemporary, Mid-Century Modern, etc.).
        2. Write 3 distinct LinkedIn post captions.
        
        The goal is to grab attention and attract potential clients for architecture projects.
        
        Tone requirements:
        1. Professional: Focus on expertise, precision, and value.
        2. Storytelling: Focus on the journey, the "why" behind the design, and human impact.
        3. Minimalist: Short, punchy, and visually driven.
        4. Technical: Focus on materials, structural innovation, and sustainability.

        Each caption should include:
        - A strong hook mentioning the identified style.
        - Insights about the architecture shown (materials, light, space, form).
        - A clear Call to Action (CTA) inviting people to collaborate or reach out for their projects.
        - 3-5 relevant hashtags including the architectural style.

        Return the response as a JSON object with:
        - "style": The identified architectural style.
        - "captions": An array of objects with "text" and "tone" fields.
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      const data = JSON.parse(responseText || '{}');
      
      setDetectedStyle(data.style || "Unknown Style");
      setCaptions((data.captions || []).map((c: any, index: number) => ({
        ...c,
        id: `caption-${index}-${Date.now()}`
      })));
    } catch (error) {
      console.error("Error generating captions:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">ArchiCaption AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-black/60">
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Free Personal Edition
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Upload & Preview */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Turn your blueprints into <span className="text-emerald-600 italic">business.</span>
              </h1>
              <p className="text-lg text-black/60 max-w-md">
                Upload your project photos and let AI craft high-converting LinkedIn captions that attract your next big client.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                ${selectedImage ? 'border-transparent' : 'border-black/10 hover:border-emerald-500 bg-white hover:bg-emerald-50/30'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {selectedImage ? (
                <>
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 font-medium shadow-xl">
                      <RefreshCw className="w-4 h-4" />
                      Change Image
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Click to upload project photo</p>
                    <p className="text-black/40 text-sm">PNG, JPG or WebP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {selectedImage && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={generateCaptions}
                disabled={isAnalyzing}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black/80 disabled:bg-black/40 transition-all shadow-xl shadow-black/10"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing Architecture...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Captions
                  </>
                )}
              </motion.button>
            )}
          </section>

          {/* Right Column: Results */}
          <section className="space-y-6 min-h-[500px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                  LinkedIn Captions
                </h2>
                {detectedStyle && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"
                  >
                    <Sparkles className="w-3 h-3" />
                    Detected Style: {detectedStyle}
                  </motion.div>
                )}
              </div>
              {captions.length > 0 && (
                <span className="text-xs font-mono uppercase tracking-widest text-black/40">
                  {captions.length} Options
                </span>
              )}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {captions.length > 0 ? (
                  captions.map((caption, idx) => (
                    <motion.div
                      key={caption.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                          {caption.tone}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(caption.text, caption.id)}
                          className="text-black/40 hover:text-black transition-colors p-2 hover:bg-black/5 rounded-lg"
                        >
                          {copiedId === caption.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-black/80 leading-relaxed whitespace-pre-wrap text-[15px]">
                        {caption.text}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/5 rounded-3xl bg-white/50">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-black/20 mb-4">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-black/40 font-medium">
                      Upload an image and click generate<br />to see AI-crafted captions here.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {captions.length > 0 && (
              <div className="bg-emerald-600 text-white p-6 rounded-3xl flex items-center justify-between group cursor-pointer overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg">Ready for your next project?</h3>
                  <p className="text-white/80 text-sm">Let's build something extraordinary together.</p>
                </div>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span className="font-bold">ArchiCaption AI</span>
          </div>
          <p className="text-sm text-black/40">
            © 2026 ArchiCaption AI. Built for architects who mean business.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-black/40 hover:text-black transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
