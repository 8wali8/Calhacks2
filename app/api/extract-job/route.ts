import { tavily } from "@tavily/core";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const JobInfoSchema = z.object({
  company: z.string(),
  role: z.string(),
  summary: z.string(),
  questions: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const { jobUrl } = await request.json();

    if (!jobUrl) {
      return NextResponse.json(
        { error: "Job URL is required" },
        { status: 400 }
      );
    }

    // Get API keys from environment variables
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!tavilyApiKey || !openaiApiKey) {
      return NextResponse.json(
        { error: "API keys not configured" },
        { status: 500 }
      );
    }

    console.log("[extract-job] Fetching job data from Tavily...");
    const tavilyClient = tavily({ apiKey: tavilyApiKey });
    const tavilyResponse = await tavilyClient.search(
      `Summarize this job posting: ${jobUrl}`,
      { includeAnswer: true }
    );

    console.log("[extract-job] Extracting structured data with OpenAI...");
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are an API that extracts structured job information from text. Respond ONLY in this exact JSON format: {\"company\": string, \"role\": string, \"summary\": string, \"questions\": string[]}",
        },
        {
          role: "user",
          content: `Extract the company, role, and job summary. Then, generate 3 interview questions that are typically asked in an interview for this role at this company: ${JSON.stringify(
            tavilyResponse
          )}`,
        },
      ],
      response_format: zodResponseFormat(JobInfoSchema, "job_info"),
    });

    const extractedData = JSON.parse(
      openaiResponse.choices[0].message.content || "{}"
    );

    console.log("[extract-job] Extraction complete:", extractedData);

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("[extract-job] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract job information",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
