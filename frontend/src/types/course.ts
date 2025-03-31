export interface Course {
  title: string;
  description: string;
  difficulty_level?: string;
  estimated_duration?: string;
  folder: string;
  timestamp?: string;
  complete: boolean;
  in_progress: boolean;
  initializing?: boolean;
}

export interface Unit {
  unit_number: number;
  unit_title: string;
  unit_description?: string;
  folder: string;
}

export interface Subunit {
  subunit_number: number;
  subunit_title: string;
  file: string;
  learning_objectives?: string[];
  key_topics?: string[];
}

export interface Frontmatter {
  title: string;
  unit: string;
  unit_number: string;
  subunit_number: number;
  course: string;
  difficulty_level?: string;
  learning_objectives?: string[];
  key_topics?: string[];
}

export interface CourseContent {
  frontmatter: Frontmatter;
  content: string;
} 