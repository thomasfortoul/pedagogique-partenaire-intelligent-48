
import React from 'react';
import { Course } from '@/types/course';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { BookOpenText, Edit, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

const CourseCard = ({ course, onEdit, onDelete }: CourseCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/course/${course.id}/dashboard`);
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-br from-ergi-light to-white h-2" />
      
      <CardContent className="pt-6 flex-grow cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start mb-3">
          <div className="p-2 bg-ergi-light/30 rounded-md mr-3 flex-shrink-0">
            <BookOpenText className="h-6 w-6 text-ergi-primary" />
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 pt-1">{course.title}</h3>
        </div>
        
        {course.description && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-3">
            {course.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          {course.level && (
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {course.level}
            </span>
          )}
          
          {course.documents && course.documents.length > 0 && (
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              <BookOpenText className="h-3 w-3 mr-1" />
              {course.documents.length} document{course.documents.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between gap-2 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/course/${course.id}/dashboard`);
          }}
          className="flex-1 hover:bg-ergi-light/20 hover:text-ergi-dark"
        >
          <Settings className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/course/${course.id}`);
          }}
          className="flex-1 hover:bg-ergi-primary/10 hover:text-ergi-primary"
        >
          <Edit className="h-4 w-4 mr-2" />
          Personnaliser
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course.id);
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
