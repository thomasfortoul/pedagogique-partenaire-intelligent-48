
import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

interface UploadDocumentFormProps {
  courseId: string;
  onUploadComplete: (document: any) => void;
  documentsCount: number;
  maxDocuments: number;
  maxSizeMB: number;
}

const UploadDocumentForm = ({ 
  courseId, 
  onUploadComplete,
  documentsCount,
  maxDocuments,
  maxSizeMB
}: UploadDocumentFormProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain'
  ];
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check if file type is allowed
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Seuls les fichiers PDF, DOCX, PPTX et TXT sont acceptés.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if file size is within limit
    if (file.size > maxSizeBytes) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille du fichier ne doit pas dépasser ${maxSizeMB} Mo.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Check if we've reached the document limit
    if (documentsCount >= maxDocuments) {
      toast({
        title: "Limite atteinte",
        description: `Vous avez atteint la limite de ${maxDocuments} documents par cours.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate a slight delay after reaching 100% before completing
        setTimeout(() => {
          // Create a new document object with mock data
          const newDocument = {
            id: Date.now().toString(),
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            uploadDate: new Date().toISOString(),
            url: URL.createObjectURL(selectedFile) // This creates a temporary URL for the file
          };
          
          onUploadComplete(newDocument);
          setIsUploading(false);
          setSelectedFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
          
          toast({
            title: "Document téléversé",
            description: `Le document "${selectedFile.name}" a été ajouté avec succès.`,
          });
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="border rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Ajouter un document</h3>
          <div className="text-sm text-gray-500">
            {documentsCount} / {maxDocuments} documents
          </div>
        </div>
        
        {!isUploading && !selectedFile ? (
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h4 className="text-sm font-medium mb-1">Cliquez pour sélectionner un fichier</h4>
            <p className="text-xs text-gray-500 mb-3">
              ou glissez-déposez un fichier ici
            </p>
            <p className="text-xs text-gray-500">
              Formats acceptés: PDF, DOCX, PPTX, TXT (max {maxSizeMB} Mo)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {selectedFile && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                </p>
              </div>
            )}
            
            {isUploading ? (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Téléversement en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-ergi-primary hover:bg-ergi-dark"
                  onClick={handleUpload}
                >
                  Téléverser
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDocumentForm;
