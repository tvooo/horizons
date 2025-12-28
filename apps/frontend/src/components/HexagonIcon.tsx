interface HexagonIconProps {
  size?: number
  className?: string
  filledVertices?: number[] // Indices of vertices to fill (0-5)
}

export function HexagonIcon({
  size = 24,
  className = '',
  filledVertices = [3, 4],
}: HexagonIconProps) {
  const viewBoxSize = 24
  const center = viewBoxSize / 2
  const strokeWidth = 2
  const radius = 10

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
  const dividerLines: string[] = []
  // const dividerLines: string[] = [vertices[3]].map((v) => `M ${center},${center} L ${v.x},${v.y}`)

  // Upper-left piece (vertices[5] to center to vertices[0])
  // This is the piece between 270° and 330° (top-left to top vertex)
  const verticesToFill = filledVertices.map(
    (v) =>
      `M ${center},${center} L ${vertices[v].x},${vertices[v].y} L ${
        vertices[(v + 1) % 6].x
      },${vertices[(v + 1) % 6].y} Z`,
  )

  return (
    <svg
      role="presentation"
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      strokeLinejoin="round"
    >
      {/* Outer hexagon */}
      <path d={hexagonPath} stroke="currentColor" strokeWidth={strokeWidth} fill="none" />

      {/* Dividing lines */}
      {dividerLines.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: The order here won't ever change
        <path key={i} d={line} stroke="currentColor" strokeWidth={strokeWidth} />
      ))}

      {/* Filled vertices */}
      {verticesToFill.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: The order here won't ever change
        <path key={i} d={line} fill="currentColor" />
      ))}
    </svg>
  )
}
