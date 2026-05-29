import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type GateSubject = {
  id: number;
  name: string;
  progress: number;
  weak: string[];
};

export type GateData = {
  subjects: GateSubject[];
  topics: ApiGateTopic[];
  mockTests: ApiGateMockTest[];
  mistakes: ApiGateMistake[];
  mockAverage: number;
  mistakeCount: number;
  revisions: number;
};

type ApiGateSubject = {
  id: number;
  name: string;
  progress_percentage: number;
};

type ApiGateTopic = {
  id: number;
  subject_id: number;
  name: string;
  is_completed: boolean;
  confidence_level: number;
  revision_count: number;
  notes: string | null;
};

type ApiGateMockTest = {
  id: number;
  test_name: string;
  score: number;
  total_marks: number;
  test_date: string | null;
  remarks: string | null;
};

type ApiGateMistake = {
  id: number;
  subject_id: number | null;
  topic_id: number | null;
  question: string;
  mistake_reason: string | null;
  correct_concept: string | null;
  priority: string | null;
  is_resolved: boolean;
};

async function fetchGateData(): Promise<GateData> {
  const [apiSubjects, topics, mockTests, mistakes] = await Promise.all([
    apiFetch<ApiGateSubject[]>("/api/gate/subjects"),
    apiFetch<ApiGateTopic[]>("/api/gate/topics"),
    apiFetch<ApiGateMockTest[]>("/api/gate/mock-tests"),
    apiFetch<ApiGateMistake[]>("/api/gate/mistakes"),
  ]);

  const unresolvedMistakes = mistakes.filter((mistake) => !mistake.is_resolved);
  const subjects = apiSubjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    progress: subject.progress_percentage,
    weak: unresolvedMistakes
      .filter((mistake) => mistake.subject_id === subject.id)
      .map((mistake) => mistake.correct_concept || mistake.mistake_reason || mistake.question),
  }));

  const mockAverage = mockTests.length
    ? Math.round(
        mockTests.reduce((total, test) => total + (test.score / test.total_marks) * 100, 0) /
          mockTests.length,
      )
    : 0;

  return {
    subjects,
    topics,
    mockTests,
    mistakes,
    mockAverage,
    mistakeCount: unresolvedMistakes.length,
    revisions: topics.reduce((total, topic) => total + topic.revision_count, 0),
  };
}

export function useGateData() {
  return useQuery({
    queryKey: ["gate"],
    queryFn: fetchGateData,
    retry: 2,
  });
}
