import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  Plus, Trash2, ChevronUp, ChevronDown, Copy, Type, AlignLeft, AlignCenter, AlignRight,
  Image, MousePointerClick, Minus, Space, Code, Palette, Eye, Pencil, Settings2, GripVertical, Ticket,
} from "lucide-react";
import {
  EmailBlock, GlobalStyles, EmailBuilderData, DEFAULT_GLOBAL_STYLES,
  createBlock, renderBlocksToHtml, renderCouponPreviewHtml, getStarterTemplates,
} from "@/lib/email-builder-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmailBuilderProps {
  value: EmailBuilderData;
  onChange: (data: EmailBuilderData) => void;
  couponMode?: string;
  discountAmount?: string;
  couponPrefix?: string;
  friendDiscountAmount?: string;
  couponExpiresAt?: string;
  minTotalPrice?: string;
  minRentalDays?: string;
}

const BLOCK_TYPE_OPTIONS: { type: EmailBlock['type']; label: string; icon: React.ReactNode }[] = [
  { type: 'heading', label: 'Titre', icon: <Type size={14} /> },
  { type: 'text', label: 'Texte', icon: <AlignLeft size={14} /> },
  { type: 'image', label: 'Image', icon: <Image size={14} /> },
  { type: 'button', label: 'Bouton', icon: <MousePointerClick size={14} /> },
  { type: 'divider', label: 'Séparateur', icon: <Minus size={14} /> },
  { type: 'spacer', label: 'Espacement', icon: <Space size={14} /> },
  { type: 'html', label: 'HTML', icon: <Code size={14} /> },
];

const FONT_OPTIONS = [
  { value: "'Poppins', Arial, sans-serif", label: "Poppins" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "monospace", label: "Monospace" },
];

const EmailBuilder = ({ value, onChange, couponMode = 'none', discountAmount = '', couponPrefix = '', friendDiscountAmount = '', couponExpiresAt = '', minTotalPrice = '', minRentalDays = '' }: EmailBuilderProps) => {
  const isMobile = useIsMobile();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [globalOpen, setGlobalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { blocks, globalStyles } = value;

  const updateBlocks = useCallback((newBlocks: EmailBlock[]) => {
    onChange({ ...value, blocks: newBlocks });
  }, [value, onChange]);

  const updateGlobals = useCallback((partial: Partial<GlobalStyles>) => {
    onChange({ ...value, globalStyles: { ...value.globalStyles, ...partial } });
  }, [value, onChange]);


  // Auto-insert/remove coupon block when couponMode changes
  useEffect(() => {
    const hasCouponBlock = blocks.some(b => b.type === 'coupon');
    if (couponMode !== 'none' && !hasCouponBlock) {
      updateBlocks([...blocks, createBlock('coupon')]);
    } else if (couponMode === 'none' && hasCouponBlock) {
      updateBlocks(blocks.filter(b => b.type !== 'coupon'));
    }
  }, [couponMode]); // intentionally only couponMode

  const addBlock = (type: EmailBlock['type']) => {
    // Insert before coupon block if present
    const couponIdx = blocks.findIndex(b => b.type === 'coupon');
    if (couponIdx >= 0) {
      const arr = [...blocks];
      arr.splice(couponIdx, 0, createBlock(type));
      updateBlocks(arr);
    } else {
      updateBlocks([...blocks, createBlock(type)]);
    }
    setShowAddMenu(false);
  };

  const removeBlock = (id: string) => {
    updateBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const arr = [...blocks];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    updateBlocks(arr);
  };

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const clone = { ...blocks[idx], id: crypto.randomUUID(), settings: { ...blocks[idx].settings } };
    const arr = [...blocks];
    arr.splice(idx + 1, 0, clone);
    updateBlocks(arr);
  };

  const updateBlock = (id: string, partial: Partial<EmailBlock>) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, ...partial } : b));
  };

  const updateBlockSettings = (id: string, partial: Partial<EmailBlock['settings']>) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, settings: { ...b.settings, ...partial } } : b));
  };

  const loadTemplate = (name: string) => {
    const tpl = getStarterTemplates().find(t => t.name === name);
    if (!tpl) return;
    onChange({ blocks: tpl.blocks.map(b => ({ ...b, id: crypto.randomUUID() })), globalStyles: { ...tpl.globals } });
    setSelectedBlockId(null);
  };

  // Update preview iframe
  useEffect(() => {
    if (!iframeRef.current) return;
    let html = renderBlocksToHtml(blocks, globalStyles);
    // Replace coupon marker with preview
    if (couponMode !== 'none') {
      const couponHtml = renderCouponPreviewHtml({ couponMode, discountAmount, couponPrefix, friendDiscountAmount, couponExpiresAt, minTotalPrice, minRentalDays });
      html = html.replace('<!--COUPON_BLOCK-->', couponHtml);
    }
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;}</style></head><body>${html}</body></html>`);
      doc.close();
    }
  }, [blocks, globalStyles, couponMode, discountAmount, couponPrefix, friendDiscountAmount, couponExpiresAt, minTotalPrice, minRentalDays]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const renderBlockEditor = (block: EmailBlock) => {
    const isSelected = selectedBlockId === block.id;
    const idx = blocks.findIndex(b => b.id === block.id);
    const isCoupon = block.type === 'coupon';

    return (
      <div
        key={block.id}
        className={`border rounded-lg transition-colors ${isCoupon ? 'border-primary/40 bg-primary/5' : isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
        onClick={() => !isCoupon && setSelectedBlockId(block.id)}
      >
        {/* Block header */}
        <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/30 rounded-t-lg">
          {isCoupon ? <Ticket size={14} className="text-primary shrink-0" /> : <GripVertical size={14} className="text-muted-foreground shrink-0" />}
          <span className={`text-xs font-medium uppercase tracking-wider flex-1 ${isCoupon ? 'text-primary' : 'text-muted-foreground'}`}>
            {isCoupon ? 'Coupon' : (BLOCK_TYPE_OPTIONS.find(o => o.type === block.type)?.label || block.type)}
          </span>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, -1); }} disabled={idx === 0}>
              <ChevronUp size={12} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={idx === blocks.length - 1}>
              <ChevronDown size={12} />
            </Button>
            {!isCoupon && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}>
                  <Copy size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>
                  <Trash2 size={12} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Block content editor */}
        {isCoupon ? (
          <div className="p-3">
            <p className="text-xs text-muted-foreground italic">Bloc coupon — configuré depuis le mode coupon ci-dessous. Utilisez les flèches pour repositionner.</p>
          </div>
        ) : (
        <div className="p-3 space-y-2">
          {(block.type === 'heading' || block.type === 'text') && (
            <>
              {block.type === 'heading' ? (
                <Input
                  value={block.content || ''}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Titre..."
                  className="font-semibold"
                />
              ) : (
                <Textarea
                  value={block.content || ''}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Texte..."
                  rows={3}
                />
              )}
            </>
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              <Input
                value={block.settings.imageUrl || ''}
                onChange={(e) => updateBlockSettings(block.id, { imageUrl: e.target.value })}
                placeholder="URL de l'image..."
              />
              <div className="flex gap-2">
                <Input
                  value={block.settings.imageAlt || ''}
                  onChange={(e) => updateBlockSettings(block.id, { imageAlt: e.target.value })}
                  placeholder="Alt text"
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={block.settings.imageWidth || '100'}
                    onChange={(e) => updateBlockSettings(block.id, { imageWidth: e.target.value })}
                    className="w-16"
                    min={10}
                    max={100}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          )}

          {block.type === 'button' && (
            <div className="space-y-2">
              <Input
                value={block.content || ''}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Texte du bouton"
              />
              <Input
                value={block.settings.buttonUrl || ''}
                onChange={(e) => updateBlockSettings(block.id, { buttonUrl: e.target.value })}
                placeholder="URL du lien"
              />
            </div>
          )}

          {block.type === 'html' && (
            <Textarea
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="<p>Code HTML personnalisé...</p>"
              rows={4}
              className="font-mono text-xs"
            />
          )}

          {block.type === 'spacer' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Hauteur:</span>
              <Input
                type="number"
                value={block.settings.spacerHeight || '24'}
                onChange={(e) => updateBlockSettings(block.id, { spacerHeight: e.target.value })}
                className="w-20"
                min={8}
                max={64}
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          )}

          {/* Style controls — shown when selected */}
          {isSelected && (block.type === 'heading' || block.type === 'text' || block.type === 'button') && (
            <div className="border-t pt-2 mt-2 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Style</p>
              <div className="flex flex-wrap gap-2">
                {/* Alignment */}
                <div className="flex border rounded-md overflow-hidden">
                  {(['left', 'center', 'right'] as const).map(a => (
                    <button
                      key={a}
                      className={`p-1.5 ${block.settings.textAlign === a ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={(e) => { e.stopPropagation(); updateBlockSettings(block.id, { textAlign: a }); }}
                    >
                      {a === 'left' ? <AlignLeft size={12} /> : a === 'center' ? <AlignCenter size={12} /> : <AlignRight size={12} />}
                    </button>
                  ))}
                </div>

                {/* Font size */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Taille:</span>
                  <Input
                    type="number"
                    value={block.settings.fontSize || '14'}
                    onChange={(e) => updateBlockSettings(block.id, { fontSize: e.target.value })}
                    className="w-14 h-7 text-xs"
                    min={10}
                    max={48}
                  />
                </div>

                {/* Font weight */}
                <button
                  className={`px-2 py-1 text-xs border rounded-md font-bold ${block.settings.fontWeight === 'bold' || block.settings.fontWeight === '700' || block.settings.fontWeight === '600' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={(e) => { e.stopPropagation(); updateBlockSettings(block.id, { fontWeight: block.settings.fontWeight === 'bold' ? 'normal' : 'bold' }); }}
                >
                  B
                </button>

                {/* Color */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Couleur:</span>
                  <input
                    type="color"
                    value={block.type === 'button' ? (block.settings.buttonBgColor || '#00C853') : (block.settings.color || '#1A1A1A')}
                    onChange={(e) => {
                      if (block.type === 'button') {
                        updateBlockSettings(block.id, { buttonBgColor: e.target.value });
                      } else {
                        updateBlockSettings(block.id, { color: e.target.value });
                      }
                    }}
                    className="w-6 h-6 rounded border cursor-pointer"
                  />
                </div>

                {block.type === 'button' && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Texte:</span>
                    <input
                      type="color"
                      value={block.settings.buttonTextColor || '#ffffff'}
                      onChange={(e) => updateBlockSettings(block.id, { buttonTextColor: e.target.value })}
                      className="w-6 h-6 rounded border cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Padding */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Haut:</span>
                  <Input type="number" value={block.settings.paddingTop || '0'} onChange={(e) => updateBlockSettings(block.id, { paddingTop: e.target.value })} className="w-14 h-7 text-xs" min={0} max={64} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Bas:</span>
                  <Input type="number" value={block.settings.paddingBottom || '0'} onChange={(e) => updateBlockSettings(block.id, { paddingBottom: e.target.value })} className="w-14 h-7 text-xs" min={0} max={64} />
                </div>
              </div>
            </div>
          )}

          {/* Divider style controls */}
          {isSelected && block.type === 'divider' && (
            <div className="border-t pt-2 mt-2 flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Couleur:</span>
                <input type="color" value={block.settings.dividerColor || '#00C853'} onChange={(e) => updateBlockSettings(block.id, { dividerColor: e.target.value })} className="w-6 h-6 rounded border cursor-pointer" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Épaisseur:</span>
                <Input type="number" value={block.settings.dividerThickness || '3'} onChange={(e) => updateBlockSettings(block.id, { dividerThickness: e.target.value })} className="w-14 h-7 text-xs" min={1} max={10} />
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    );
  };

  const editorContent = (
    <div className="space-y-3">
      {/* Template loader + Global styles */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select onValueChange={loadTemplate}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Charger un modèle..." />
          </SelectTrigger>
          <SelectContent>
            {getStarterTemplates().map(t => (
              <SelectItem key={t.name} value={t.name}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Collapsible open={globalOpen} onOpenChange={setGlobalOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
              <Settings2 size={14} /> Style global
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Global styles panel */}
      <Collapsible open={globalOpen} onOpenChange={setGlobalOpen}>
        <CollapsibleContent>
          <div className="border rounded-lg p-3 bg-card space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style global de l'email</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Fond de l'email</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={globalStyles.emailBgColor} onChange={(e) => updateGlobals({ emailBgColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                  <Input value={globalStyles.emailBgColor} onChange={(e) => updateGlobals({ emailBgColor: e.target.value })} className="flex-1 h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Fond du contenu</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={globalStyles.contentBgColor} onChange={(e) => updateGlobals({ contentBgColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                  <Input value={globalStyles.contentBgColor} onChange={(e) => updateGlobals({ contentBgColor: e.target.value })} className="flex-1 h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Police</label>
                <Select value={globalStyles.fontFamily} onValueChange={(v) => updateGlobals({ fontFamily: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Couleur d'accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={globalStyles.accentColor} onChange={(e) => updateGlobals({ accentColor: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                  <Input value={globalStyles.accentColor} onChange={(e) => updateGlobals({ accentColor: e.target.value })} className="flex-1 h-8 text-xs" />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Blocks */}
      <div className="space-y-2">
        {blocks.map(block => renderBlockEditor(block))}
      </div>

      {/* Add block */}
      <div className="relative">
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddMenu(!showAddMenu)}>
          <Plus size={14} /> Ajouter un bloc
        </Button>
        {showAddMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-1 border rounded-lg bg-popover shadow-lg p-2 grid grid-cols-2 sm:grid-cols-4 gap-1 z-10">
            {BLOCK_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.type}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => addBlock(opt.type)}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const previewContent = (
    <div className="border rounded-lg overflow-hidden bg-muted/30">
      <div className="bg-muted/50 px-3 py-1.5 flex items-center gap-2 border-b">
        <Eye size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Aperçu</span>
      </div>
      <iframe
        ref={iframeRef}
        title="Email preview"
        className="w-full bg-background"
        style={{ height: isMobile ? '400px' : '500px', border: 'none' }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex border rounded-lg overflow-hidden">
          <button
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mobileView === 'editor' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => setMobileView('editor')}
          >
            <Pencil size={14} /> Modifier
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mobileView === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => setMobileView('preview')}
          >
            <Eye size={14} /> Aperçu
          </button>
        </div>
        {mobileView === 'editor' ? editorContent : previewContent}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>{editorContent}</div>
      <div className="sticky top-4">{previewContent}</div>
    </div>
  );
};

export default EmailBuilder;
