'use client';
import dagre from "@dagrejs/dagre";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import { useMemo, useState } from "react";
import { useTheme, useWidgetSDK } from "@nitrostack/widgets";

export const dynamic = "force-dynamic";

function getEdgeColor(type: string) {
  switch (type.toLowerCase()) {
    case "supports":
      return "#22c55e";

    case "contradicts":
      return "#ef4444";

    case "extends":
      return "#3b82f6";

    case "related":
      return "#f59e0b";

    default:
      return "#9ca3af";
  }
}

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
  confidence: number;
  explanation: string;
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
const nodeWidth = 180;
const nodeHeight = 120;

function layoutGraph(nodes: Node[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));

  graph.setGraph({
    rankdir: "TB",
    ranksep: 120,
    nodesep: 80,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const pos = graph.node(node.id);

    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
    };
  });
}

export default function GraphView() {



  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  
  const response = getToolOutput<BuildGraphResponse>();
  const data = response?.graph;
  const [selectedEdge, setSelectedEdge] =
  useState<GraphEdge | null>(null);
   const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#333333' : '#e5e7eb';
  const nodesBg = isDark ? '#2d3748' : '#f3f4f6';
  const flowNodes: Node[] = useMemo(() => {
    if (!data) return [];
  return data.nodes.map((node, index) => ({
    id: node.id,
    data: {
      label: (
        <div style={{ textAlign: "center", padding: 6 }}>
          <img
            src={node.imageUrl}
            alt={node.title}
            style={{
              width: 55,
              height: 55,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {node.label}
          </div>
          <div
            style={{
              fontSize: 10,
              opacity: 0.7,
            }}
          >
            {node.authors.length} author
            {node.authors.length !== 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    position: {
  x: 0,
  y: 0,
},
    style: {
      width: 180,
      borderRadius: 12,
      border: `2px solid ${isDark ? "#555" : "#ddd"}`,
      background: isDark ? "#2d3748" : "#ffffff",
      color: textColor,
      boxShadow: "0 4px 10px rgba(0,0,0,.15)",
    },
  }));
}, [data, isDark, textColor]);

const flowEdges: Edge[] = useMemo(() => {
  if (!data) return [];
  return data.edges.map((edge, index) => ({
    id: String(index),
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.confidence > 0.9,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: getEdgeColor(edge.label),
      strokeWidth: 3,
    },
    labelStyle: {
      fill: getEdgeColor(edge.label),
      fontWeight: 700,
    },
    data: {
      source: edge.source,
      target: edge.target,
      label: edge.label,
      confidence: edge.confidence,
      explanation: edge.explanation,
    },
  }));
}, [data]);
const layoutedGraph = useMemo(() => {
  return {
    nodes: layoutGraph([...flowNodes], [...flowEdges]),
    edges: flowEdges,
  };
}, [flowNodes, flowEdges]);

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
     <div
  style={{
    marginBottom: "24px",
    background: nodesBg,
    borderRadius: "12px",
    padding: "16px",
    height: "600px",
  }}
>
  <ReactFlow
    nodes={layoutedGraph.nodes}
    edges={layoutedGraph.edges}
    fitView
    attributionPosition="bottom-left"
    onEdgeClick={(_, edge) => {
      setSelectedEdge(edge.data as GraphEdge);
    }}
  >
    <MiniMap
      pannable
      zoomable
      style={{
        background: isDark ? "#1f2937" : "#ffffff",
      }}
    />

    <Controls />

    <Background gap={18} />
  </ReactFlow>
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
      {selectedEdge && (
  <div
    style={{
      marginTop: 20,
      padding: 16,
      borderRadius: 10,
      background: nodesBg,
      border: `1px solid ${borderColor}`,
    }}
  >
    <h3>Relationship Details</h3>

    <p>
      <strong>Type:</strong> {selectedEdge.label}
    </p>

    <p>
      <strong>Confidence:</strong>{" "}
      {(selectedEdge.confidence * 100).toFixed(0)}%
    </p>

    <p>
      <strong>Explanation:</strong>
    </p>

    <p>{selectedEdge.explanation}</p>
  </div>
)}

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
