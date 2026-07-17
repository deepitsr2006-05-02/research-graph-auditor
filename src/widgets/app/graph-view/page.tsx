'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface GraphNode {
  id: string;
  label: string;
  title: string;
  imageUrl: string;
  authors: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface BuildGraphResponse {
  success: boolean;
  graph: GraphData;
  nodeCount: number;
  edgeCount: number;
}

export default function GraphView() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  
  const response = getToolOutput<BuildGraphResponse>();
  const data = response?.graph;

  if (!isReady) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Initializing...
      </div>
    );
  }

  if (!data || !data.nodes || !data.edges) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Loading graph data...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#333333' : '#e5e7eb';
  const nodesBg = isDark ? '#2d3748' : '#f3f4f6';

  // Calculate node positions in a circular layout
  const radius = 150;
  const centerX = 250;
  const centerY = 250;
  
  const nodePositions: Record<string, { x: number; y: number }> = {};
  data.nodes.forEach((node, index) => {
    const angle = (index / data.nodes.length) * 2 * Math.PI;
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div style={{
      padding: '24px',
      background: bgColor,
      borderRadius: '16px',
      color: textColor,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
          Citation Network
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          {data.nodes.length} papers • {data.edges.length} citations
        </p>
      </div>

      {/* SVG Graph Visualization */}
      <div style={{
        marginBottom: '24px',
        background: nodesBg,
        borderRadius: '12px',
        padding: '16px',
        overflow: 'auto',
        maxHeight: '400px',
      }}>
        <svg
          width="100%"
          height="500"
          viewBox="0 0 500 500"
          style={{ minWidth: '500px' }}
        >
          {/* Draw edges */}
          {data.edges.map((edge, idx) => {
            const source = nodePositions[edge.source];
            const target = nodePositions[edge.target];
            if (!source || !target) return null;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isDark ? '#666666' : '#d1d5db'}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 5}
                  fontSize="10"
                  fill={isDark ? '#999999' : '#6b7280'}
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {edge.label.substring(0, 15)}
                </text>
              </g>
            );
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill={isDark ? '#666666' : '#d1d5db'}
              />
            </marker>
          </defs>

          {/* Draw nodes */}
          {data.nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            return (
              <g key={`node-${node.id}`}>
                {/* Node circle background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="35"
                  fill={isDark ? '#3b82f6' : '#3b82f6'}
                  opacity="0.9"
                />

                {/* Node image or initials */}
                <image
                  x={pos.x - 30}
                  y={pos.y - 30}
                  width="60"
                  height="60"
                  href={node.imageUrl}
                  style={{
                    borderRadius: '50%',
                    clipPath: 'circle(30px)',
                  }}
                  onError={(e: any) => {
                    // Fallback to initials if image fails
                    const target = e.target as any;
                    target.style.display = 'none';
                  }}
                />

                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y + 50}
                  fontSize="11"
                  fill={textColor}
                  textAnchor="middle"
                  style={{
                    pointerEvents: 'none',
                    fontWeight: 'bold',
                    maxWidth: '80px',
                  }}
                >
                  {node.label}
                </text>

                {/* Tooltip on hover */}
                <title>{node.title}</title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Papers List */}
      <div style={{
        marginTop: '24px',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Papers in Network
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {data.nodes.map((node) => (
            <div
              key={node.id}
              style={{
                padding: '12px',
                background: nodesBg,
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                fontSize: '13px',
              }}
            >
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <img
                  src={node.imageUrl}
                  alt={node.title}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    objectFit: 'cover',
                  }}
                  onError={(e: any) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '12px',
                    marginBottom: '4px',
                    lineHeight: '1.3',
                  }}>
                    {node.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                  }}>
                    {node.authors.length} author{node.authors.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: `1px solid ${borderColor}`,
        fontSize: '12px',
        opacity: 0.7,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>✨ Citation Network Visualization</span>
        <span>Theme: {theme || 'light'}</span>
      </div>
    </div>
  );
}
