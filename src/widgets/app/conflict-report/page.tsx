'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface Conflict {
  topic: string;
  claim1: string;
  paper1Id: string;
  paper1Title: string;
  paper1ImageUrl: string;
  claim2: string;
  paper2Id: string;
  paper2Title: string;
  paper2ImageUrl: string;
  conflictDescription: string;
}

interface FindConflictsResponse {
  success: boolean;
  topic: string;
  conflictCount: number;
  conflicts: Conflict[];
}

export default function ConflictReport() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  
  const response = getToolOutput<FindConflictsResponse>();

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

  if (!response || !response.conflicts) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: theme === 'dark' ? '#fff' : '#000',
      }}>
        Loading conflict data...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#333333' : '#e5e7eb';
  const cardBg = isDark ? '#2d3748' : '#f9fafb';
  const warningBg = isDark ? '#7c2d12' : '#fef3c7';
  const warningText = isDark ? '#fbbf24' : '#92400e';

  const conflicts = response.conflicts ?? [];

  return (
    <div style={{
      padding: '24px',
      background: bgColor,
      borderRadius: '16px',
      color: textColor,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
          Conflict Report
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
          Topic: <strong>{response.topic}</strong>
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.6 }}>
          Found {response.conflictCount} potential conflicts
        </p>
      </div>

      {/* Conflicts List */}
      {conflicts.length === 0 ? (
        <div style={{
          padding: '32px 24px',
          textAlign: 'center',
          background: cardBg,
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            No conflicts found
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.7 }}>
            The papers in your collection appear to be consistent on this topic.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {conflicts.map((conflict, idx) => (
            <div
              key={`conflict-${idx}`}
              style={{
                padding: '16px',
                background: cardBg,
                borderRadius: '12px',
                border: `2px solid ${warningBg}`,
                borderLeft: `4px solid ${warningText}`,
              }}
            >
              {/* Conflict Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '20px',
                  background: warningBg,
                  color: warningText,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}>
                  ⚠
                </span>
                <div>
                  <div style={{
                    fontSize: '13px',
                    opacity: 0.7,
                    marginBottom: '2px',
                  }}>
                    Conflicting Claims
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.5,
                  }}>
                    Conflict #{idx + 1}
                  </div>
                </div>
              </div>

              {/* Conflict Description */}
              <div style={{
                padding: '12px',
                background: isDark ? '#1a1a1a' : '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '13px',
                lineHeight: '1.5',
                fontStyle: 'italic',
              }}>
                {conflict.conflictDescription}
              </div>

              {/* Two-column paper comparison */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                {/* Paper 1 */}
                <div style={{
                  padding: '12px',
                  background: isDark ? '#1a1a1a' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                  }}>
                    <img
                      src={conflict.paper1ImageUrl}
                      alt={conflict.paper1Title}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        objectFit: 'cover',
                      }}
                      onError={(e: any) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '2px',
                        lineHeight: '1.3',
                      }}>
                        {conflict.paper1Title}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        opacity: 0.6,
                      }}>
                        Paper 1
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    lineHeight: '1.4',
                    padding: '8px',
                    background: isDark ? '#2d3748' : '#f3f4f6',
                    borderRadius: '4px',
                    borderLeft: `3px solid #3b82f6`,
                  }}>
                    "{conflict.claim1}"
                  </div>
                </div>

                {/* Paper 2 */}
                <div style={{
                  padding: '12px',
                  background: isDark ? '#1a1a1a' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                  }}>
                    <img
                      src={conflict.paper2ImageUrl}
                      alt={conflict.paper2Title}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        objectFit: 'cover',
                      }}
                      onError={(e: any) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '2px',
                        lineHeight: '1.3',
                      }}>
                        {conflict.paper2Title}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        opacity: 0.6,
                      }}>
                        Paper 2
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    lineHeight: '1.4',
                    padding: '8px',
                    background: isDark ? '#2d3748' : '#f3f4f6',
                    borderRadius: '4px',
                    borderLeft: `3px solid #ef4444`,
                  }}>
                    "{conflict.claim2}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: `1px solid ${borderColor}`,
        fontSize: '12px',
        opacity: 0.7,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>📋 Conflict Analysis Report</span>
        <span>Theme: {theme || 'light'}</span>
      </div>
    </div>
  );
}
