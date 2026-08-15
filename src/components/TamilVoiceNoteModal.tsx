'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loadRecipeIntoEditor } from '@/store/editorSlice';
import { mockAdaiRecipe } from '@/lib/mockRecipe';

interface TamilVoiceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TamilVoiceNoteModal({ isOpen, onClose }: TamilVoiceNoteModalProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState<'record' | 'transcribing' | 'review'>('record');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Editable Transcripts (Story 28 & 31)
  const [tamilScript, setTamilScript] = useState(
    'அடை செய்யறதுக்கு ரெண்டு கப் பச்சரிசி, ரெண்டு கப் புழுங்கல் அரிசி, தோரம் பருப்பு, உளுத்தம் பருப்பு, பாசிப் பருப்பு, கடலைப் பருப்பு எல்லாத்தையும் சம அளவு எடுத்து நாலு மணி நேரம் ஊற வச்சு, காஞ்ச மிளகாய், இஞ்சி, பெருங்காயம், தேவையான அளவு உப்பு சேர்த்து கரகரப்பா அரைச்சு மாவை 12 மணி நேரம் வச்சு அப்புறம் தோசைக் கல்லுல சுடணும்.'
  );
  const [tanglishScript, setTanglishScript] = useState(
    '2 cup pacha arisi, 2 cup puzhungal arisi, thoora parupu, ulutham parupu, kadalai paruppu equal measure... nalla 4 mani neram oora vachu, kanja milagai, inji, perungayam, thevaiyana alavu uppu serthu grind coarse... 12 hours rest approm tawa la roast pannanum.'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setUploadedFileName(null);
    let sec = 0;
    const interval = setInterval(() => {
      sec += 1;
      setRecordTimer(sec);
      if (sec >= 3) {
        clearInterval(interval);
        setIsRecording(false);
        setStep('transcribing');
        setTimeout(() => {
          setStep('review');
        }, 1400);
      }
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setStep('transcribing');
      setTimeout(() => {
        setStep('review');
      }, 1200);
    }
  };

  const handleApplyToEditor = () => {
    // Populate editor with extracted modular recipe (Story 32)
    dispatch(loadRecipeIntoEditor(mockAdaiRecipe));
    onClose();
    router.push('/editor');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_150ms_ease-out]">
      <div className="bg-[#181818] border border-border-subtle rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-card-bg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎙️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Tamil Voice Note to Recipe AI</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/40 uppercase">
                  Initiative 6
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Record or upload raw Tamil/Tanglish kitchen voice notes to extract structured recipes with human review.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-border-subtle/50 text-text-muted hover:text-foreground hover:bg-border-subtle flex items-center justify-center transition-colors text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {step === 'record' && (
            <div className="space-y-6 text-center py-6">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-24 h-24 mx-auto rounded-full bg-accent/10 border-2 border-dashed border-accent/40 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                  {isRecording ? '🔴' : '🎙️'}
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isRecording ? `Recording Tamil Voice Memo... (00:0${recordTimer})` : 'Speak or Upload Cooking Voice Note'}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Describe ingredients, ratios, and steps in everyday spoken Tamil or Tanglish. Example:
                  <br />
                  <span className="italic text-accent/90">
                    &quot;அடைக்கு 2 கப் பச்சரிசி, 2 கப் புழுங்கல் அரிசி, தோரம் பருப்பு போட்டு 4 மணி நேரம் ஊற வைங்க...&quot;
                  </span>
                </p>
              </div>

              {/* Hidden File Input for Audio Notes */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*,.mp3,.m4a,.wav,.ogg"
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSimulateRecording}
                  disabled={isRecording}
                  className="px-6 py-3 rounded-xl bg-accent text-background font-bold text-sm hover:bg-accent/80 transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <span>{isRecording ? '⏹ Recording Voice...' : '🎤 Record Tamil Audio Note'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3 rounded-xl bg-card-bg border border-border-subtle text-foreground text-sm font-semibold hover:border-accent/50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>📁</span>
                  <span>Upload Audio File (.m4a, .mp3, WhatsApp)</span>
                </button>
              </div>
            </div>
          )}

          {step === 'transcribing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">AI Speech-to-Text & Extraction in Progress...</h3>
                <p className="text-xs text-text-muted">
                  Transcribing Tamil audio ➔ Transliterating Tanglish ➔ Mapping into 3 Modular Cooking Phases...
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-5 animate-[fadeIn_200ms_ease-out]">
              {/* Audio Waveform Simulator */}
              <div className="p-4 rounded-xl bg-card-bg border border-border-subtle flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center font-bold text-base hover:bg-accent/80 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-text-muted font-mono">
                    <span>{uploadedFileName || 'Tamil_Cooking_Note_Adai_01.m4a'}</span>
                    <span>0:32 / 0:32</span>
                  </div>
                  <div className="flex items-center gap-1 h-6">
                    {[40, 70, 90, 60, 30, 80, 100, 50, 60, 40, 90, 100, 70, 40, 30, 60, 80, 50].map((h, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-full transition-all ${
                          isPlaying ? 'bg-accent animate-pulse' : 'bg-border-subtle'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Review Interface (Story 31) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editable Transcript (Story 28) */}
                <div className="p-4 rounded-xl bg-background border border-border-subtle space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-1">
                      🗣️ Editable Spoken Transcript (Tamil Unicode)
                    </span>
                    <textarea
                      value={tamilScript}
                      onChange={e => setTamilScript(e.target.value)}
                      rows={4}
                      className="w-full bg-card-bg border border-border-subtle rounded-lg p-2.5 text-xs text-foreground/90 leading-relaxed outline-none focus:border-accent resize-none font-sans"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                      Phonetic Tanglish Transliteration:
                    </span>
                    <textarea
                      value={tanglishScript}
                      onChange={e => setTanglishScript(e.target.value)}
                      rows={3}
                      className="w-full bg-card-bg border border-border-subtle rounded-lg p-2 text-[11px] text-text-muted italic outline-none focus:border-accent resize-none font-mono"
                    />
                  </div>
                </div>

                {/* AI Extracted Schema with Confidence Scoring (Stories 29 & 30) */}
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/30 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                        ✨ Extracted Modular Recipe
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        98% AI Confidence
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-foreground">
                      <div className="flex justify-between border-b border-accent/20 pb-1">
                        <span className="text-text-muted">Recipe Name:</span>
                        <span className="font-bold text-foreground">Traditional Tamil Adai</span>
                      </div>
                      <div className="flex justify-between border-b border-accent/20 pb-1">
                        <span className="text-text-muted">Phases Detected:</span>
                        <span className="font-medium text-accent">Prep (Soak, Grind) → Rest (12h) → Cook</span>
                      </div>
                      <div className="flex justify-between border-b border-accent/20 pb-1">
                        <span className="text-text-muted">Ratio Group:</span>
                        <span className="font-medium text-foreground">Rice to Dal Ratio (1:0.5)</span>
                      </div>
                      <div className="flex justify-between border-b border-accent/20 pb-1">
                        <span className="text-text-muted">Ingredients Mapped:</span>
                        <span className="font-mono text-foreground font-bold">12 Master Ingredients</span>
                      </div>
                    </div>

                    {/* Ambiguity Highlighting (Story 30) */}
                    <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <span>🟡</span>
                        <span>Ambiguity Detected & Resolved:</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-tight">
                        &quot;தேவையான அளவு உப்பு&quot; mapped to <strong>Salt: 10g (Optional Taste Override)</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 rounded-xl bg-card-bg border border-accent/40 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-text-muted">
                  Human-in-the-loop: Review and finalize in Noter Studio.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('record')}
                    className="px-4 py-2 rounded-xl bg-border-subtle/60 text-foreground text-xs font-semibold hover:bg-border-subtle cursor-pointer"
                  >
                    Record Again
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyToEditor}
                    className="px-5 py-2 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/80 transition-all flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer"
                  >
                    <span>🚀</span>
                    <span>Load Extracted Recipe in Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
