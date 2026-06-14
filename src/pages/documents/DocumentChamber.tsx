import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, Eye, Pen, Check, X, Download, Trash2,
  FileSignature, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { ChamberDocument, Signature, DocumentStatus } from '../../types';

const STATUS_LABELS: Record<DocumentStatus, { label: string; variant: 'gray' | 'warning' | 'primary' | 'success' | 'error' }> = {
  draft: { label: 'Draft', variant: 'gray' },
  pending_review: { label: 'Pending Review', variant: 'warning' },
  signed: { label: 'Signed', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
};

const SignaturePad: React.FC<{
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full cursor-crosshair touch-none"
          style={{ minHeight: 200 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={clearPad}>Clear</Button>
        <Button size="sm" variant="primary" leftIcon={<Check size={14} />} onClick={handleSave}>Apply Signature</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      <p className="text-xs text-gray-400">Sign using your mouse or touch</p>
    </div>
  );
};

export const DocumentChamber: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ChamberDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ChamberDocument | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedFileUrl(url);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const newDoc: ChamberDocument = {
      id: `doc${Date.now()}`,
      name: file.name,
      type: ext,
      size: `${sizeMB} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      url,
      ownerId: user?.id || '',
      pages: ext === 'PDF' ? Math.ceil(file.size / 50000) : undefined,
    };
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (e.target) e.target.value = '';
  };

  const updateStatus = (docId: string, status: DocumentStatus) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d));
    if (selectedDoc?.id === docId) setSelectedDoc(prev => prev ? { ...prev, status } : null);
  };

  const handleSignatureSave = (dataUrl: string) => {
    if (!selectedDoc || !user) return;
    const sig: Signature = {
      id: `sig${Date.now()}`,
      documentId: selectedDoc.id,
      userId: user.id,
      signedAt: new Date().toISOString(),
      dataUrl,
    };
    updateStatus(selectedDoc.id, 'signed');
    setShowSignaturePad(false);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setUploadedFileUrl(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, preview, and sign your documents</p>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleInputChange}
        />
        <Upload size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-700 font-medium">Drop your files here or click to browse</p>
        <p className="text-gray-500 text-sm mt-1">Supports PDF, DOC, DOCX, PNG, JPG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
            </CardHeader>
            <CardBody className="space-y-2 max-h-96 overflow-y-auto">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">No documents uploaded yet</p>
              ) : (
                documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDoc?.id === doc.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <FileText size={20} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.size} &middot; {doc.uploadedAt}</p>
                      </div>
                      <Badge variant={STATUS_LABELS[doc.status].variant} size="sm">
                        {STATUS_LABELS[doc.status].label}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  fullWidth
                  variant="outline"
                  leftIcon={<Upload size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload New
                </Button>
                {selectedDoc && (
                  <>
                    <Button
                      fullWidth
                      variant="outline"
                      leftIcon={<Download size={16} />}
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = selectedDoc.url;
                        a.download = selectedDoc.name;
                        a.click();
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      leftIcon={<Pen size={16} />}
                      onClick={() => setShowSignaturePad(true)}
                    >
                      Sign Document
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-primary-600" />
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{selectedDoc.name}</h2>
                      <p className="text-sm text-gray-500">
                        {selectedDoc.type} &middot; {selectedDoc.size}
                        {selectedDoc.pages && ` \u00B7 ${selectedDoc.pages} pages`}
                        &middot; Uploaded {selectedDoc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_LABELS[selectedDoc.status].variant}>
                      {STATUS_LABELS[selectedDoc.status].label}
                    </Badge>
                    <Button size="xs" variant="ghost" onClick={() => deleteDocument(selectedDoc.id)} className="text-error-500">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: 400 }}>
                    {selectedDoc.type === 'PDF' || selectedDoc.name.match(/\.(pdf|PDF)$/) ? (
                      <iframe
                        src={selectedDoc.url}
                        className="w-full h-full border-0"
                        style={{ minHeight: 500 }}
                        title={selectedDoc.name}
                      />
                    ) : selectedDoc.name.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
                      <img
                        src={selectedDoc.url}
                        alt={selectedDoc.name}
                        className="w-full h-full object-contain"
                        style={{ maxHeight: 500 }}
                      />
                    ) : (
                      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
                        <div className="text-center">
                          <FileText size={48} className="text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Preview not available for this file type</p>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Download size={16} />}
                            className="mt-3"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = selectedDoc.url;
                              a.download = selectedDoc.name;
                              a.click();
                            }}
                          >
                            Download to view
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900">Document Status</h2>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-wrap gap-3">
                    {(Object.entries(STATUS_LABELS) as [DocumentStatus, typeof STATUS_LABELS[DocumentStatus]][]).map(([status, info]) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedDoc.id, status)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          selectedDoc.status === status
                            ? `border-${info.variant === 'gray' ? 'gray' : info.variant}-500 bg-${info.variant === 'gray' ? 'gray' : info.variant}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Badge variant={info.variant}>{info.label}</Badge>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {showSignaturePad && (
                <Card>
                  <CardHeader className="flex items-center gap-2">
                    <FileSignature size={20} className="text-primary-600" />
                    <h2 className="text-lg font-medium text-gray-900">Signature Pad</h2>
                  </CardHeader>
                  <CardBody>
                    <SignaturePad
                      onSave={handleSignatureSave}
                      onCancel={() => setShowSignaturePad(false)}
                    />
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Eye size={28} className="text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Document Selected</h3>
                  <p className="text-gray-500">Upload a document or select one from the list to preview</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
