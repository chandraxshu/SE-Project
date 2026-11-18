import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { Item } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const formattedDate = new Date(item.date_occurred).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="card-hover flex flex-col h-full overflow-hidden group">
      {/* Thumbnail or placeholder */}
      <div className="relative w-full h-44 bg-surface-100 overflow-hidden shrink-0 border-b border-surface-100">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-surface-400 bg-surface-100">
            <CategoryIcon category={item.category} className="w-10 h-10 mb-1 opacity-60 text-primary-600" />
            <span className="text-2xs font-medium uppercase tracking-wider text-surface-400">
              {item.category}
            </span>
          </div>
        )}

        {/* Badge in top corner */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-2xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              item.report_type === 'found'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            {item.report_type === 'found' ? 'Found' : 'Lost'}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} type="item" size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-base font-semibold text-surface-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {item.title}
        </h4>

        <p className="text-xs text-surface-500 mt-1 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="mt-4 pt-3 border-t border-surface-100 flex flex-col gap-1.5 text-xs text-surface-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-surface-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-surface-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="mt-3 pt-2 flex items-center justify-between">
          <Link
            to={`/items/${item.id}`}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {item.report_type === 'found' && item.status === 'active' && (
            <Link
              to={`/items/${item.id}/claim`}
              className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 px-2.5 py-1 rounded-md font-medium transition-colors"
            >
              Claim
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
