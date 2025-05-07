
import React from 'react';
import { Document } from '@/types/course';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { File, FileText, FileImage, FileMinus, FileSliders, Trash } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

const DocumentList = ({ documents, onDelete }: DocumentListProps) => {
  // Function to determine which icon to show based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <File className="h-6 w-6 text-red-500" />;
    if (fileType.includes('doc') || fileType.includes('txt')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (fileType.includes('image')) return <FileImage className="h-6 w-6 text-green-500" />;
    if (fileType.includes('presentation') || fileType.includes('ppt')) return <FileSliders className="h-6 w-6 text-amber-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileMinus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Aucun document</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          Aucun document n'a été ajouté à ce cours. Ajoutez des documents pour enrichir votre contenu pédagogique.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <Card key={document.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(document.fileType)}
                <div>
                  <h4 className="font-medium line-clamp-1">{document.fileName}</h4>
                  <div className="flex text-xs text-gray-500 gap-2 mt-0.5">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                onClick={() => onDelete(document.id)}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
