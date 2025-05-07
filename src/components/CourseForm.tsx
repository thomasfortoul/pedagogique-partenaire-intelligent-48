
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Course } from '@/types/course';

// Schema validation for course form
const courseSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  level: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  onSubmit: (course: Course) => void;
  onCancel: () => void;
}

const CourseForm = ({ course, onSubmit, onCancel }: CourseFormProps) => {
  const isEditing = !!course;
  
  // Initialize form with existing course data if editing
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      level: course?.level || '',
    }
  });

  const handleSubmit = (data: CourseFormValues) => {
    onSubmit({
      id: course?.id || '',
      title: data.title,
      description: data.description,
      level: data.level,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du cours *</FormLabel>
              <FormControl>
                <Input placeholder="Mathématiques CM1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Une description détaillée du contenu du cours..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau d'enseignement</FormLabel>
              <FormControl>
                <Input placeholder="CM1, 6ème, 2nde..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button type="submit" className="bg-ergi-primary hover:bg-ergi-dark">
            {isEditing ? 'Mettre à jour' : 'Créer le cours'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CourseForm;
