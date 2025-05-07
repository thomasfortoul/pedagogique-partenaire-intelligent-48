
import React from 'react';
import { Course } from '@/types/course';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { BookOpenText, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

const CourseCard = ({ course, onEdit, onDelete }: CourseCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start mb-2">
          <BookOpenText className="h-5 w-5 text-ergi-primary mr-2 flex-shrink-0" />
          <h3 className="font-medium text-lg line-clamp-2">{course.title}</h3>
        </div>
        
        {course.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">
            {course.description}
          </p>
        )}
        
        {course.level && (
          <div className="mt-3">
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {course.level}
            </span>
          </div>
        )}
        
        {course.documents && course.documents.length > 0 && (
          <div className="mt-3 text-sm text-gray-500">
            {course.documents.length} document{course.documents.length > 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(course);
          }}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course.id);
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-1"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
