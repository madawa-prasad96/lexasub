import { ExperienceLevel } from '../types';

export const formatRelativeDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const filenameWithoutExtension = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '');
};

export const getLevelDescription = (level: ExperienceLevel): string => {
  const descriptions: Record<ExperienceLevel, string> = {
    Beginner: 'Show all vocabulary words',
    Elementary: 'Skip A1 basic words',
    Intermediate: 'Skip A1–A2 words',
    Advanced: 'Skip A1–B1, show B2+ only',
  };
  return descriptions[level];
};

export const cefrLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    A1: '#4CAF50',
    A2: '#009688',
    B1: '#2196F3',
    B2: '#9C27B0',
    C1: '#FF9800',
    C2: '#F44336',
    Unknown: '#9E9E9E',
  };
  return colors[level] ?? '#9E9E9E';
};
