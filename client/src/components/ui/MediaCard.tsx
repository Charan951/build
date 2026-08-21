import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './Badge';

interface MediaCardProps {
  image?: string;
  imageAlt?: string;
  badge?: string;
  title: string;
  meta?: string;
  /** Route to navigate to — renders as a real, natively keyboard-accessible Link. */
  href?: string;
  /** Use instead of `href` only when the card also contains its own nested
   * interactive elements (e.g. external store links) that need independent
   * click handling — mirrors the keyboard-accessible pattern already proven
   * on FeaturedProjectsSection's cards. */
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/** One image+badge+meta+CTA card shape — replaces the separately hand-built
 * blog card in BlogListPage and project card in FeaturedProjectsSection. */
export const MediaCard: React.FC<MediaCardProps> = ({
  image,
  imageAlt,
  badge,
  title,
  meta,
  href,
  onClick,
  children,
  className = '',
}) => {
  const body = (
    <>
      {image && (
        <div className="aspect-[16/10] w-full overflow-hidden">
          <img src={image} alt={imageAlt ?? title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-6 space-y-3">
        {badge && <Badge variant="dark">{badge}</Badge>}
        <h3 className="font-display text-lg font-extrabold text-dark leading-snug line-clamp-2">{title}</h3>
        {meta && <p className="text-xs font-semibold text-mutedOnLight line-clamp-1">{meta}</p>}
        {children}
      </div>
    </>
  );

  const cardClasses = `group flex flex-col h-full rounded-card bg-white border border-dark/10 shadow-soft hover:shadow-hover hover:-translate-y-2 transition-all duration-300 overflow-hidden focus-ring`;

  if (href) {
    return (
      <Link to={href} className={`${cardClasses} ${className}`}>
        {body}
      </Link>
    );
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`${cardClasses} cursor-pointer ${className}`}
    >
      {body}
    </div>
  );
};
