interface ProjectIconProps {
  size?: number
  className?: string
  percentage: number
}

export function ProjectIcon({ size = 24, className = '', percentage }: ProjectIconProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  // Lucide icons use a 24x24 viewBox and stroke-width of 2
  const viewBoxSize = 24
  const center = viewBoxSize / 2
  const strokeWidth = 2

  // Outer circle radius (leaving room for stroke)
  const outerRadius = 10

  // Gap between outer circle and pie
  const gap = 1

  // Inner pie radius
  const pieRadius = outerRadius - strokeWidth - gap

  // Generate pie path based on percentage
  const generatePiePath = (): string => {
    if (clampedPercentage === 0) return ''

    if (clampedPercentage === 100) {
      // Full circle - just return a circle path
      return `M ${center} ${center} m -${pieRadius}, 0 a ${pieRadius},${pieRadius} 0 1,0 ${pieRadius * 2},0 a ${pieRadius},${pieRadius} 0 1,0 -${pieRadius * 2},0`
    }

    // Calculate angle in radians (starting from top, going clockwise)
    const angleInDegrees = (clampedPercentage / 100) * 360
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180)

    // Calculate end point of arc
    const endX = center + pieRadius * Math.cos(angleInRadians)
    const endY = center + pieRadius * Math.sin(angleInRadians)

    // Large arc flag (1 if angle > 180 degrees)
    const largeArcFlag = clampedPercentage > 50 ? 1 : 0

    // Start from center, line to top, arc to end point, close path
    return `M ${center} ${center} L ${center} ${center - pieRadius} A ${pieRadius} ${pieRadius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
  }

  const piePath = generatePiePath()

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
      {/* Outer circle (stroke only) */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Inner pie chart (filled) */}
      {piePath && <path d={piePath} fill="currentColor" />}
    </svg>
  )
}
