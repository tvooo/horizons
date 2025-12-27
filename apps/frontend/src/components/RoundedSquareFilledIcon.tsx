interface RoundedSquareFilledIconProps {
  size?: number
  className?: string
}

export function RoundedSquareFilledIcon({
  size = 24,
  className = '',
}: RoundedSquareFilledIconProps) {
  const viewBoxSize = 24

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
        fill="currentColor"
      />
    </svg>
  )
}
