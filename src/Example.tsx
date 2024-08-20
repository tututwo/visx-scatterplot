import React, { useMemo, useState, useCallback, useRef } from "react";

import genRandomNormalPoints, {
  PointsRange,
} from "@visx/mock-data/lib/generators/genRandomNormalPoints";

import { GradientTealBlue,LinearGradient,GradientSteelPurple } from "@visx/gradient";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle } from "@visx/shape";
import { localPoint } from "@visx/event";
import { voronoi, VoronoiPolygon } from "@visx/voronoi";
import { withTooltip, Tooltip } from "@visx/tooltip";

// TODO: Add tooltip
// TODO: Add brush
// TODO: Add zoom
const points: PointsRange[] = genRandomNormalPoints(
  1000,
  /* seed= */ 0.2
).filter((_, i) => i < 600 && i > 10);

const x = (d: PointsRange) => d[0];
const y = (d: PointsRange) => d[1];

export default withTooltip(
  ({
    width,
    height,
    showControls = true,
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  }: DotsProps & WithTooltipProvidedProps<PointsRange>) => {
    const svgRef = useRef(null);

    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [1.3, 2.2],
          range: [0, width],
          clamp: true,
        }),
      [width]
    );
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          domain: [0.75, 1.6],
          range: [height, 0],
          clamp: true,
        }),
      [height]
    );
    const voronoiLayout = useMemo(
      () =>
        voronoi<PointsRange>({
          x: (d) => xScale(x(d)) ?? 0,
          y: (d) => yScale(y(d)) ?? 0,
          width,
          height,
        })(points),
      [width, height, xScale, yScale]
    );
    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        if (!svgRef.current) return;

        const point = localPoint(svgRef.current, event);
        if (!point) return;
        const closest = voronoiLayout.find(point.x, point.y, 100);

        if (closest) {
          showTooltip({
            tooltipLeft: xScale(x(closest.data)),
            tooltipTop: yScale(y(closest.data)),
            tooltipData: closest.data,
          });
        }
      },
      [xScale, yScale, showTooltip, voronoiLayout]
    );
    return (
      <div>
        <svg width={width} height={height} ref={svgRef}>
          <GradientSteelPurple id="dots-blue" />
          <LinearGradient id={'linear-gradient'} from="pink" to="#621A61" rotate="-45" />
          <rect
            width={width}
            height={height}
            rx={1}
            fill="url(#dots-blue)"
            onMouseMove={handleMouseMove}
          />
          <Group pointerEvents="none">
            {points.map((point, i) => (
              <Circle
                key={`point-${point[0]}-${i}`}
                className="dot"
                cx={xScale(x(point))}
                cy={yScale(y(point))}
                r={i % 3 === 0 ? 2 : 3}
                fill="white"
              />
            ))}
            {
              voronoiLayout
                .polygons()
                .map((polygon, i) => (
                  <VoronoiPolygon
                    key={`polygon-${i}`}
                    polygon={polygon}
                    fill="white"
                   stroke="url(#linear-gradient)"
                    strokeWidth={2}
                    strokeOpacity={0.99}
                    fillOpacity={tooltipData === polygon.data ? 0.5 : 0}
                  />
                ))}
          </Group>
        </svg>

        {tooltipOpen &&
          tooltipData &&
          tooltipLeft != null &&
          tooltipTop != null && (
            <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
              <div>
                <strong>x:</strong> {x(tooltipData)}
              </div>
              <div>
                <strong>y:</strong> {y(tooltipData)}
              </div>
            </Tooltip>
          )}
      </div>
    );
  }
);
