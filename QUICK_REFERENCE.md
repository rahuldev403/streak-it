# 🚀 Quick Reference - DSA System

## 🔑 Environment Variables (Required)

```env
OPENAI_API_KEY=sk-proj-xxxxx
JUDGE0_API_KEY=your-rapidapi-key
JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

## 📡 API Endpoints

| Method | Endpoint                                   | Description                    |
| ------ | ------------------------------------------ | ------------------------------ |
| POST   | `/api/dsa/generate-question`               | Generate personalized question |
| POST   | `/api/dsa/submit-code`                     | Submit code for execution      |
| GET    | `/api/dsa/questions?userId=X`              | List user's questions          |
| GET    | `/api/dsa/questions/[id]?userId=X`         | Get specific question          |
| DELETE | `/api/dsa/questions?questionId=X&userId=Y` | Delete question                |
| GET    | `/api/dsa/progress?userId=X`               | Get user progress              |
| PUT    | `/api/dsa/progress`                        | Update progress                |
| GET    | `/api/dsa/submissions?userId=X`            | Get submissions                |

## 💻 Client Usage

```typescript
import { dsaApi } from "@/lib/dsa-client";

// Generate question
const { question } = await dsaApi.generateQuestion(userId);

// Submit code
const result = await dsaApi.submitCode({
  userId,
  questionId: 1,
  code: "def solution():\n    pass",
  language: "python",
});

// Get progress
const { progress } = await dsaApi.getUserProgress(userId);
```

## 🎨 UI Helper Functions

```typescript
import {
  getDifficultyBadgeColor,
  getStatusBadgeColor,
  formatExecutionTime,
  formatMemory,
  formatStatus
} from '@/lib/dsa-client';

// Usage in components
<Badge className={getDifficultyBadgeColor("easy")}>
  EASY
</Badge>

<Badge className={getStatusBadgeColor("accepted")}>
  {formatStatus("accepted")}
</Badge>
```

## 🗄️ Database Tables

```typescript
dsa_questions
- id, userId, title, description
- difficulty, category, constraints
- examples, testCases, starterCode (JSON)
- hints, tags, complexities

dsa_submissions
- id, userId, questionId
- code, language, status
- executionTime, memory
- testCasesPassed, totalTestCases

user_dsa_progress
- id, userId
- totalQuestionsSolved (by difficulty)
- skillLevel (auto-updated)
- preferredCategories, weakCategories
```

## 🎯 Personalization Logic

```typescript
Difficulty Selection:
- Beginner (0-10): Easy only
- Intermediate (10-50): 70% easy, 30% medium
- Advanced (50-100): 50% medium, 50% hard
- Expert (100+): 30% medium, 70% hard

Category Selection:
- 70% chance: Focus on weak categories
- 30% chance: Random for variety

Skill Level Upgrades:
- 10 solved → Intermediate
- 50 solved → Advanced
- 100 solved → Expert
```

## 🌐 Supported Languages

```typescript
Python (71), JavaScript (63), Java (62), C++ (54)
C (50), TypeScript (74), Go (60), Rust (73)
```

## 📊 Example Component Import

```typescript
// Practice Page
import DSAPracticeExample from "@/app/_components/DSAPracticeExample";
<DSAPracticeExample userId={userId} />

// Progress Dashboard
import DSAProgressDashboard from "@/app/_components/DSAProgressDashboard";
<DSAProgressDashboard userId={userId} />
```

## ⚡ Quick Start Commands

```bash
# Setup environment
cp .env.example .env.local
# Add your API keys to .env.local

# Run migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Start server
npm run dev

# Test generation
curl -X POST http://localhost:3000/api/dsa/generate-question \
  -H "Content-Type: application/json" \
  -d '{"userId": "test"}'
```

## 💰 Cost Estimates

**OpenAI:** $0.01-0.05 per question
**Judge0 Free:** 50 executions/day
**Judge0 Basic:** $5/mo - 500/day
**Judge0 Pro:** $15/mo - 5000/day

## 🔗 Important Links

- OpenAI API Keys: https://platform.openai.com/api-keys
- Judge0 (RapidAPI): https://rapidapi.com/judge0-official/api/judge0-ce
- OpenAI Billing: https://platform.openai.com/account/billing
- Judge0 Docs: https://ce.judge0.com/

## 🎓 Key Features

✅ **100% Personalized** per user
✅ **AI-Generated** original questions
✅ **Adaptive Difficulty** based on skill
✅ **Weakness-Focused** learning
✅ **8 Languages** supported
✅ **Real Execution** with Judge0
✅ **Auto Progress** tracking
✅ **Skill Level** auto-upgrade

## 📁 Created Files

```
✅ app/config/schema.tsx (updated)
✅ app/api/dsa/generate-question/route.ts
✅ app/api/dsa/submit-code/route.ts
✅ app/api/dsa/questions/route.ts
✅ app/api/dsa/questions/[questionId]/route.ts
✅ app/api/dsa/progress/route.ts
✅ app/api/dsa/submissions/route.ts
✅ types/dsa.ts
✅ lib/dsa-client.ts
✅ app/_components/DSAPracticeExample.tsx
✅ app/_components/DSAProgressDashboard.tsx
✅ .env.example
✅ DSA_FEATURE_README.md
✅ SETUP_GUIDE.md
✅ IMPLEMENTATION_SUMMARY.md
```

## 🆘 Troubleshooting

**OpenAI Error 401:** Check API key is correct
**OpenAI Error 429:** Exceeded quota/rate limit
**Judge0 Error 403:** Not subscribed or invalid key
**Judge0 Error 429:** Daily limit reached
**DB Error:** Run migrations again

---

**Ready to build? Start with SETUP_GUIDE.md! 🚀**
