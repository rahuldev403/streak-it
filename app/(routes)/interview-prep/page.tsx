"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Cpu, Network, Code2, Brain } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

interface Bundle {
  id: string;
  name: string;
  category: "dbms" | "os" | "network" | "oops" | "dsa";
  description: string;
  questionsPerGeneration: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  type: "mcq" | "coding";
}

const INTERVIEW_BUNDLES: Bundle[] = [
  {
    id: "dbms",
    name: "DBMS",
    category: "dbms",
    description:
      "Database Management Systems - SQL, Normalization, Transactions, Indexing",
    questionsPerGeneration: 15,
    icon: <Database className="h-8 w-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    type: "mcq",
  },
  {
    id: "os",
    name: "Operating Systems",
    category: "os",
    description: "Processes, Threads, Memory Management, Scheduling, Deadlocks",
    questionsPerGeneration: 15,
    icon: <Cpu className="h-8 w-8" />,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    type: "mcq",
  },
  {
    id: "network",
    name: "Computer Networks",
    category: "network",
    description: "OSI Model, TCP/IP, HTTP, DNS, Routing, Network Security",
    questionsPerGeneration: 15,
    icon: <Network className="h-8 w-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    type: "mcq",
  },
  {
    id: "oops",
    name: "OOP Concepts",
    category: "oops",
    description: "Classes, Objects, Inheritance, Polymorphism, Design Patterns",
    questionsPerGeneration: 15,
    icon: <Code2 className="h-8 w-8" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    type: "mcq",
  },
  {
    id: "dsa",
    name: "DSA Coding",
    category: "dsa",
    description:
      "Data Structures & Algorithms - Arrays, Trees, Graphs, DP, Greedy",
    questionsPerGeneration: 10,
    icon: <Brain className="h-8 w-8" />,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    type: "coding",
  },
];

export default function InterviewPrepPage() {
  const { user } = useUser();
  const router = useRouter();
  const [generatingBundle, setGeneratingBundle] = useState<string | null>(null);

  const handleGenerateQuestions = async (bundle: Bundle) => {
    if (!user) {
      toast.error("Please sign in to generate questions");
      return;
    }

    setGeneratingBundle(bundle.id);

    try {
      if (bundle.type === "mcq") {
        // Generate CS Fundamentals MCQs
        const response = await axios.post("/api/cs-fundamentals/generate", {
          userId: user.id,
          category: bundle.category,
          count: bundle.questionsPerGeneration,
          difficulty: "mixed",
        });

        toast.success(
          `Generated ${response.data.questions.length} ${bundle.name} questions!`,
        );

        // Navigate to MCQ practice page
        router.push(`/interview-prep/cs-fundamentals/${bundle.category}`);
      } else {
        // Generate DSA Coding Questions
        const response = await axios.post("/api/dsa/generate-ai", {
          userId: user.id,
          count: bundle.questionsPerGeneration,
          difficulty: "mixed",
        });

        toast.success(
          `Generated ${response.data.questions.length} DSA coding problems!`,
        );

        // Navigate to DSA practice page
        router.push(`/interview-prep/dsa`);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setGeneratingBundle(null);
    }
  };

  const handleViewExisting = (bundle: Bundle) => {
    if (!user) {
      toast.error("Please sign in to view questions");
      return;
    }

    if (bundle.type === "mcq") {
      router.push(`/interview-prep/cs-fundamentals/${bundle.category}`);
    } else {
      router.push(`/interview-prep/dsa`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* TODO: Replace with custom icon/image */}
          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
          <h1 className="text-4xl font-normal font-game bg-black bg-clip-text text-transparent">
            AI Interview Prep
          </h1>
        </div>
        <p className="text-lg font-comfortaa text-muted-foreground max-w-2xl mx-auto">
          Generate personalized interview questions powered by AI. All questions
          are private and tailored specifically for you.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-4 border-purple-200 dark:border-purple-800 rounded p-6 mb-8">
        <div className="flex items-start gap-4">
          {/* TODO: Replace with custom icon/image */}
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-game font-semibold text-lg mb-2">
              How It Works
            </h3>
            <ul className="space-y-2 text-sm font-comfortaa text-muted-foreground">
              <li>
                Click "Generate Questions" to create personalized questions
                using AI
              </li>
              <li>
                CS Fundamentals (DBMS, OS, Networks, OOP): 15 MCQ questions per
                generation
              </li>
              <li>DSA Coding: 10 coding problems per generation</li>
              <li>All questions are private and only visible to you</li>
              <li>Track your progress and identify weak areas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTERVIEW_BUNDLES.map((bundle) => (
          <Card
            key={bundle.id}
            className={`${bundle.bgColor} border-4 border-black dark:border-gray-600 rounded hover:shadow-xl transition-all`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded border-2 border-black dark:border-gray-600 ${bundle.color} bg-white dark:bg-gray-800`}
                >
                  {bundle.icon}
                </div>
                <Badge
                  variant="secondary"
                  className="font-game font-semibold rounded"
                >
                  {bundle.questionsPerGeneration} questions
                </Badge>
              </div>
              <CardTitle className="text-2xl font-game mt-4">
                {bundle.name}
              </CardTitle>
              <CardDescription className="text-sm font-comfortaa">
                {bundle.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleGenerateQuestions(bundle)}
                disabled={generatingBundle === bundle.id}
                className="w-full font-game text-black rounded"
                variant="pixel"
              >
                {generatingBundle === bundle.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Questions"
                )}
              </Button>
              <Button
                onClick={() => handleViewExisting(bundle)}
                variant="outline"
                className="w-full font-game border-2 border-black dark:border-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                View My Questions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-sm font-comfortaa text-muted-foreground">
        <p>
          Tip: Generate questions regularly to keep practicing and improving
          your skills!
        </p>
      </div>
    </div>
  );
}
