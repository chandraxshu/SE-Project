import React from 'react';
import {
  Smartphone,
  FileText,
  Wallet,
  Key,
  BookOpen,
  Shirt,
  Wine,
  Package,
} from 'lucide-react';
import type { ItemCategory } from '@/types';

interface CategoryIconProps {
  category: ItemCategory | string;
  className?: string;
}

export function CategoryIcon({ category, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (category) {
    case 'electronics':
      return <Smartphone className={className} />;
    case 'documents':
      return <FileText className={className} />;
    case 'wallets':
      return <Wallet className={className} />;
    case 'keys':
      return <Key className={className} />;
    case 'books':
      return <BookOpen className={className} />;
    case 'clothing':
      return <Shirt className={className} />;
    case 'bottles':
      return <Wine className={className} />;
    default:
      return <Package className={className} />;
  }
}
