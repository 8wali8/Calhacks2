"use client";

/**
 * Main interview page - simplified with job URL input
 */

import { useState } from "react";
import { TavusInterview } from "@/components/TavusInterview";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { useTavusWebComponent } from "@/components/TavusInterviewWebComponent";
import {
  PersonaInput,
  InterviewContext,
  UIMessage,
  TavusObjectivesPayload,
} from "@/types";

interface ExtractedJobData {
  company: string;
  role: string;
  summary: string;
  questions: string[];
}

export default function HomePage() {
  // Register web component
  useTavusWebComponent();

  // Job extraction state
  const [jobUrl, setJobUrl] = useState("https://www.metacareers.com/jobs/1471056164046415");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<ExtractedJobData | null>(null);

  // Interview state
  const [isInterviewRunning, setIsInterviewRunning] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [finalSummary, setFinalSummary] = useState<any>(null);

  // Extract job data from URL
  const handleExtractJob = async () => {
    if (!jobUrl.trim()) {
      setExtractError("Please enter a job URL");
      return;
    }

    setExtracting(true);
    setExtractError(null);
    setJobData(null);

    try {
      const response = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extract job data");
      }

      const data: ExtractedJobData = await response.json();
      setJobData(data);
      console.log("[HomePage] Job data extracted:", data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setExtractError(message);
      console.error("[HomePage] Extract error:", err);
    } finally {
      setExtracting(false);
    }
  };

  // Build persona and context from extracted data
  const persona: PersonaInput | null = jobData
    ? {
        name: `${jobData.company} Recruiter`,
        systemPrompt: `You are a friendly recruiter at ${jobData.company} conducting an interview for the ${jobData.role} position. Ask thoughtful questions about the candidate's experience and skills relevant to this role. Be conversational and encouraging. Here are some key questions to cover: ${jobData.questions.join("; ")}`,
        topics: ["experience", "technical skills", "motivation", "culture fit"],
        tone: "friendly",
        followUpStyle: "balanced",
        questionStyle: "hybrid",
        maxQuestions: 5,
        maxFollowUpsPerQuestion: 2,
        attachContextFromInterview: true,
      }
    : null;

  const context: InterviewContext | null = jobData
    ? {
        company: jobData.company,
        role: jobData.role,
        seniority: "Mid-Senior",
        jdHighlights: [jobData.summary],
        extraContext: `Interview questions focus: ${jobData.questions.join(", ")}`,
      }
    : null;

  const objectives: TavusObjectivesPayload = {
    data: [
      {
        objective_name: "assess_technical_fit",
        objective_prompt:
          "Evaluate the candidate's technical expertise and how it aligns with the role requirements.",
        confirmation_mode: "auto",
      },
      {
        objective_name: "evaluate_motivation",
        objective_prompt:
          "Assess the candidate's motivation for the role and alignment with company values.",
        confirmation_mode: "auto",
      },
    ],
  };

  // Handle interview events
  const handleEvent = (message: UIMessage) => {
    console.log("[HomePage] Interview event:", message.type);

    if (message.type === "connected") {
      setIsInterviewRunning(true);
    } else if (message.type === "disconnected") {
      // Mark interview as stopped but don't auto-redirect
      setIsInterviewRunning(false);
    } else if (message.type === "error") {
      setIsInterviewRunning(false);
    }
  };

  // Manually end interview and go to finalization
  const handleEndInterview = () => {
    setIsInterviewRunning(false);
    setInterviewEnded(true);
  };

  // Handle analytics summary
  const handleAnalyticsSummary = (summary: any) => {
    setFinalSummary(summary);
  };

  // Start interview
  const handleStartInterview = () => {
    setInterviewStarted(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f9fafb',
    }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          AI Interview Practice
        </h1>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {interviewEnded ? (
          // Finalization Screen
          <div style={{
            maxWidth: '800px',
            margin: '80px auto',
            padding: '0 24px',
            width: '100%',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#10b981',
                }}>
                  Interview Complete!
                </h2>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '15px',
                }}>
                  Here's how you performed
                </p>
              </div>

              {finalSummary && (
                <>
                  {/* Session Info */}
                  <div style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '24px',
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                    }}>
                      Session Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                          Company
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {jobData?.company || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                          Role
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {jobData?.role || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                          Duration
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {finalSummary.session?.durationSeconds || 0}s
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                      margin: '0 0 16px 0',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#111827',
                    }}>
                      Performance Overview
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '16px',
                    }}>
                      <div style={{
                        padding: '20px',
                        background: '#f0f9ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '8px', fontWeight: 500 }}>
                          Speech Rate
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
                          {finalSummary.speech.wpm?.mean ? Math.round(finalSummary.speech.wpm.mean) : '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#60a5fa' }}>
                          words/min
                        </div>
                      </div>

                      <div style={{
                        padding: '20px',
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px', fontWeight: 500 }}>
                          Filler Words
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
                          {finalSummary.speech.fillers_per_min?.mean ? Math.round(finalSummary.speech.fillers_per_min.mean) : '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#d97706' }}>
                          per minute
                        </div>
                      </div>

                      <div style={{
                        padding: '20px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', fontWeight: 500 }}>
                          Gaze Stability
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: '#14532d', marginBottom: '4px' }}>
                          {finalSummary.face.gaze_stability?.mean ? Math.round(finalSummary.face.gaze_stability.mean) : '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#22c55e' }}>
                          lower is better
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transcript Summary */}
                  {finalSummary.transcript?.word_count > 0 && (
                    <div style={{
                      padding: '16px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '24px',
                    }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                      }}>
                        Your Response
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                      }}>
                        Total words spoken: {finalSummary.transcript.word_count}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '32px',
              }}>
                <button
                  onClick={() => {
                    setInterviewEnded(false);
                    setInterviewStarted(false);
                    setJobData(null);
                    setJobUrl("");
                    setFinalSummary(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Try Another Interview
                </button>
              </div>
            </div>
          </div>
        ) : !interviewStarted ? (
          // Job URL Input Screen
          <div style={{
            maxWidth: '600px',
            margin: '80px auto',
            padding: '0 24px',
            width: '100%',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: 600,
              }}>
                Enter Job URL
              </h2>
              <p style={{
                margin: '0 0 24px 0',
                color: '#6b7280',
                fontSize: '14px',
              }}>
                Paste a job posting URL to generate a personalized interview
              </p>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://www.metacareers.com/jobs/..."
                  disabled={extracting || !!jobData}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {extractError && (
                <div style={{
                  padding: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}>
                  {extractError}
                </div>
              )}

              {!jobData ? (
                <button
                  onClick={handleExtractJob}
                  disabled={extracting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: extracting ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: extracting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {extracting ? "Analyzing Job Posting..." : "Analyze Job"}
                </button>
              ) : (
                <>
                  <div style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#166534',
                    }}>
                      Job Extracted
                    </h3>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#166534' }}>
                      <strong>Company:</strong> {jobData.company}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#166534' }}>
                      <strong>Role:</strong> {jobData.role}
                    </p>
                    <p style={{ margin: '0', fontSize: '13px', color: '#166534' }}>
                      <strong>Questions:</strong> {jobData.questions.length} generated
                    </p>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Start Interview
                  </button>

                  <button
                    onClick={() => {
                      setJobData(null);
                      setJobUrl("");
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'transparent',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginTop: '8px',
                    }}
                  >
                    Try Different Job
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          // Interview Screen - side-by-side layout
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
            {/* Interview iframe - takes up main space */}
            <div style={{
              flex: 1,
              display: 'flex',
              padding: '16px',
              minWidth: 0,
            }}>
              {persona && context && (
                <div style={{
                  width: '100%',
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <TavusInterview
                    persona={persona}
                    context={context}
                    objectives={objectives}
                    autoplay={true}
                    onEvent={handleEvent}
                  />
                </div>
              )}
            </div>

            {/* Analytics Panel - sidebar */}
            <div style={{
              width: '400px',
              borderLeft: '1px solid #e5e7eb',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}>
              <AnalyticsPanel
                isInterviewRunning={isInterviewRunning}
                onSummary={handleAnalyticsSummary}
                onFinalize={handleEndInterview}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
