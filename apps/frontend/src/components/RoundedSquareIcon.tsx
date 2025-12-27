interface RoundedSquareIconProps {
  size?: number
  className?: string
}

export function RoundedSquareIcon({ size = 24, className = '' }: RoundedSquareIconProps) {
  const viewBoxSize = 24
  const strokeWidth = 2

  // Square dimensions (leaving room for stroke)
  const squareSize = 20
  const position = (viewBoxSize - squareSize) / 2
  const borderRadius = 3

  return (
    <svg
      role="presentation"
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x={position}
        y={position}
        width={squareSize}
        height={squareSize}
        rx={borderRadius}
        ry={borderRadius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
      />
    </svg>
  )
}
