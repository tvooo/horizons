interface HexagonIconProps {
  size?: number
  className?: string
}

export function HexagonIcon({ size = 24, className = '' }: HexagonIconProps) {
  const viewBoxSize = 24
  const center = viewBoxSize / 2
  const strokeWidth = 2
  const radius = 9.5

  // Calculate hexagon vertices (pointy-top orientation)
  // Starting from top (0°) and going clockwise
  const vertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180) // Start from top
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  })

  // Create hexagon path
  const hexagonPath = `M ${vertices.map((v) => `${v.x},${v.y}`).join(' L ')} Z`

  // Create dividing lines from center to each vertex
  const dividerLines = vertices.map((v) => `M ${center},${center} L ${v.x},${v.y}`)

  // Upper-left piece (vertices[5] to center to vertices[0])
  // This is the piece between 270° and 330° (top-left to top vertex)
  const upperLeftPiece = `M ${center},${center} L ${vertices[5].x},${vertices[5].y} L ${vertices[0].x},${vertices[0].y} Z`

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
      {/* Outer hexagon */}
      <path d={hexagonPath} stroke="currentColor" strokeWidth={strokeWidth} fill="none" />

      {/* Dividing lines */}
      {dividerLines.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: The order here won't ever change
        <path key={i} d={line} stroke="currentColor" strokeWidth={strokeWidth} />
      ))}

      {/* Upper-left filled piece */}
      <path d={upperLeftPiece} fill="currentColor" />
    </svg>
  )
}
