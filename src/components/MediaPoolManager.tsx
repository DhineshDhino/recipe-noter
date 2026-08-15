'use client';

import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addPhotosToPool, removePhotoFromPool, updatePoolPhoto } from '@/store/editorSlice';
import { PoolPhoto, StepImageStage } from '@/lib/types';

export default function MediaPoolManager() {
  const dispatch = useDispatch();
  const photoPool = useSelector((state: RootState) => state.editor.photoPool || []);
  const editorState = useSelector((state: RootState) => state.editor);

  const [batchUrls, setBatchUrls] = useState('');
  const [showBatchUrlInput, setShowBatchUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate usage of pool photos across all steps in prep, passive, cook
  const usageMap = React.useMemo(() => {
    const map: Record<string, { count: number; stepNames: string[] }> = {};

    const checkStep = (step: any, blockName: string, phaseName: string) => {
      (step.images || []).forEach((img: any) => {
        const matchingPool = photoPool.find(p => p.url === img.url || p.id === img.id);
        if (matchingPool) {
          if (!map[matchingPool.id]) map[matchingPool.id] = { count: 0, stepNames: [] };
          map[matchingPool.id].count++;
          map[matchingPool.id].stepNames.push(`${phaseName}: ${blockName}`);
        }
      });
    };

    editorState.prepBlocks.forEach(b => b.steps.forEach(s => checkStep(s, b.name, 'Prep')));
    editorState.passiveBlocks.forEach(b => b.steps.forEach(s => checkStep(s, b.name, 'Rest')));
    editorState.cookBlocks.forEach(b => b.steps.forEach(s => checkStep(s, b.name, 'Cook')));

    return map;
  }, [photoPool, editorState.prepBlocks, editorState.passiveBlocks, editorState.cookBlocks]);

  // Handle local file uploads (multiple files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: Array<{ url: string; caption?: string; defaultStage?: StepImageStage }> = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          newPhotos.push({
            url: event.target.result as string,
            caption: fileNameWithoutExt,
            defaultStage: idx % 2 === 0 ? 'while_cooking' : 'after_step',
          });
        }
        filesProcessed++;
        if (filesProcessed === files.length) {
          dispatch(addPhotosToPool(newPhotos));
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle batch URL addition
  const handleAddBatchUrls = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchUrls
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    const newPhotos = lines.map((url, idx) => ({
      url,
      caption: `Photo ${photoPool.length + idx + 1}`,
      defaultStage: (idx % 2 === 0 ? 'while_cooking' : 'after_step') as StepImageStage,
    }));

    dispatch(addPhotosToPool(newPhotos));
    setBatchUrls('');
    setShowBatchUrlInput(false);
  };

  // Quick preset photos
  const handleLoadSamplePresets = () => {
    const samples = [
      {
        url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
        caption: 'Soaked mixed dals & rice in bowl',
        defaultStage: 'while_cooking' as StepImageStage,
      },
      {
        url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        caption: 'Semi-coarse batter texture with dal flecks',
        defaultStage: 'while_cooking' as StepImageStage,
      },
      {
        url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
        caption: 'Golden crispy crust with porous surface holes',
        defaultStage: 'after_step' as StepImageStage,
      },
      {
        url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        caption: 'Simmering rich aromatic masala base in pan',
        defaultStage: 'while_cooking' as StepImageStage,
      },
      {
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        caption: 'Traditional frothy filter coffee crown',
        defaultStage: 'after_step' as StepImageStage,
      },
    ];
    dispatch(addPhotosToPool(samples));
  };

  return (
    <section className="bg-card-bg border border-border-subtle rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📸</span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>Recipe Media Bin & Photo Pool</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent/15 text-accent">
                {photoPool.length} {photoPool.length === 1 ? 'photo' : 'photos'}
              </span>
            </h2>
            <p className="text-xs text-text-muted">
              Upload all cooking photos at once. Drag & drop or pick them into any step in Prep, Rest, or Cooking phases.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/85 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Upload multiple images from computer"
          >
            <span>📁</span>
            <span>Upload Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBatchUrlInput(!showBatchUrlInput)}
            className="px-3 py-1.5 rounded-xl bg-background border border-border-subtle hover:border-accent/40 text-foreground text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔗</span>
            <span>Paste URLs</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSamplePresets}
            className="px-3 py-1.5 rounded-xl bg-background border border-border-subtle hover:border-accent/40 text-text-muted hover:text-foreground text-xs font-medium transition-all"
            title="Load sample high-quality cooking photography"
          >
            Sample Presets
          </button>
        </div>
      </div>

      {/* Batch URL Textarea Modal/Drawer */}
      {showBatchUrlInput && (
        <form
          onSubmit={handleAddBatchUrls}
          className="p-4 rounded-xl bg-background border border-accent/40 space-y-3 animate-[fadeIn_150ms_ease-out]"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-accent uppercase tracking-wider">
              Paste Image URLs (One URL per line)
            </label>
            <button
              type="button"
              onClick={() => setShowBatchUrlInput(false)}
              className="text-text-muted hover:text-foreground text-xs"
            >
              ✕ Cancel
            </button>
          </div>
          <textarea
            value={batchUrls}
            onChange={e => setBatchUrls(e.target.value)}
            placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg&#10;https://example.com/photo3.jpg"
            rows={3}
            className="w-full bg-card-bg border border-border-subtle rounded-lg p-3 text-xs font-mono text-foreground placeholder:text-text-muted/40 outline-none focus:border-accent resize-y"
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={!batchUrls.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent text-background text-xs font-bold hover:bg-accent/85 disabled:opacity-40 transition-all cursor-pointer"
            >
              Add to Photo Pool
            </button>
          </div>
        </form>
      )}

      {/* Empty State vs Photo Grid */}
      {photoPool.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-subtle hover:border-accent/50 rounded-2xl p-8 text-center space-y-3 cursor-pointer bg-background/50 hover:bg-background/80 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-2xl mx-auto">
            🖼️
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Your Recipe Photo Pool is Empty</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mt-1">
              Dump all your process & outcome photos here. You can then drag them into any step in Prep, Rest, or Cook phases!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-xs font-semibold text-accent underline">Upload Files from Device</span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs text-text-muted">or paste image links</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photoPool.map((photo, idx) => {
            const usage = usageMap[photo.id];
            const isUsed = Boolean(usage && usage.count > 0);

            return (
              <div
                key={photo.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                      url: photo.url,
                      caption: photo.caption,
                      stage: photo.defaultStage || 'while_cooking',
                    })
                  );
                }}
                className="group relative flex flex-col justify-between bg-background border border-border-subtle hover:border-accent/60 rounded-2xl p-3 space-y-3 transition-all hover:shadow-lg cursor-grab active:cursor-grabbing"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-border-subtle/60">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Pool photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Drag Handle Overlay Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white flex items-center gap-1">
                    <span>⠿</span>
                    <span>Drag to Step</span>
                  </div>

                  {/* Usage Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isUsed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm'
                      }`}
                    >
                      {isUsed ? `📌 Assigned (${usage?.count})` : '⚡ Unassigned'}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(removePhotoFromPool(photo.id))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-warning text-white text-xs flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove from pool"
                  >
                    ✕
                  </button>
                </div>

                {/* Caption & Default Stage */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={e =>
                      dispatch(updatePoolPhoto({ id: photo.id, caption: e.target.value }))
                    }
                    placeholder="Photo caption / description..."
                    className="w-full bg-card-bg border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-foreground placeholder:text-text-muted/40 outline-none focus:border-accent"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-text-muted">Default Stage:</span>
                    <select
                      value={photo.defaultStage || 'while_cooking'}
                      onChange={e =>
                        dispatch(
                          updatePoolPhoto({
                            id: photo.id,
                            defaultStage: e.target.value as StepImageStage,
                          })
                        )
                      }
                      className="bg-card-bg border border-border-subtle rounded-md px-2 py-0.5 text-[10px] text-foreground outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="while_cooking">👨‍🍳 While Cooking (Process)</option>
                      <option value="after_step">✨ After Step (Result)</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
