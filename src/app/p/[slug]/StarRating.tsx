'use client';

interface StarRatingProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md';
}

const sizeMap = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const sizeClass = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;

        return (
          <svg
            key={star}
            className={`${sizeClass} ${filled ? 'text-amber-400' : half ? 'text-amber-400' : 'text-gray-200'}`}
            viewBox="0 0 24 24"
            fill={filled || half ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={filled || half ? 0 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        );
      })}
    </div>
  );
}
