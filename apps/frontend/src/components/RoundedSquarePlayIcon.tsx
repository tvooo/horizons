interface RoundedSquarePlayIconProps {
  size?: number
  className?: string
}

export function RoundedSquarePlayIcon({ size = 24, className = '' }: RoundedSquarePlayIconProps) {
  const viewBoxSize = 24
  const strokeWidth = 2

  // Square dimensions
  const squareSize = 20
  const position = (viewBoxSize - squareSize) / 2
  const borderRadius = 3

  // Play triangle dimensions (centered in the square)
  const center = viewBoxSize / 2
  const triangleSize = 10
  const triangleLeft = center - triangleSize / 3
  const triangleTop = center - triangleSize / 2
  const triangleBottom = center + triangleSize / 2
  const triangleRight = center + (triangleSize * 2) / 3

  const playPath = `M ${triangleLeft},${triangleTop} L ${triangleRight},${center} L ${triangleLeft},${triangleBottom} Z`

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
      <path d={playPath} fill="currentColor" />
    </svg>
  )
}
