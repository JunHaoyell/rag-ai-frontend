"use client";

import { useState, useEffect } from "react";

interface Bubble {
  id: number;
  text: string;
  visible: boolean;
  x: number;
  y: number;
}

const COMMON_QUESTIONS: string[] = [
  "公司标准工作时间是多久？",
  "每年有多少天带薪年假？",
  "加班需要什么批准？",
  "员工离职流程是什么？",
  "远程办公规定有哪些？",
  "病假政策是什么？",
  "员工如何保护公司机密信息？",
];

export default function Home() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // 顺序显示气泡，循环
  useEffect(() => {
    let idx = 0;

    const showNext = () => {
      const q = COMMON_QUESTIONS[idx];
      const bubbleId = Date.now(); // 唯一 id

      // 添加气泡
      setBubbles((prev) => [
        ...prev,
        {
          id: bubbleId,
          text: q,
          visible: true,
          x: 0, // container 内左对齐
          y: 300, // 起始位置
        },
      ]);

      // 3 秒后消失
      setTimeout(() => {
        setBubbles((prev) =>
          prev.map((b) => (b.id === bubbleId ? { ...b, visible: false } : b))
        );
      }, 5000);

      idx = (idx + 1) % COMMON_QUESTIONS.length; // 循环
      setTimeout(showNext, 4300); // 1.2 秒后显示下一个
    };

    showNext();
  }, []);

  // 上浮动画 + 循环
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.y - 1.5, // 上浮速度
          }))
          .map((b) => {
            // 超出顶部，回到底部继续循环
            if (b.y < -10) {
              return { ...b, y: 200 };
            }
            return b;
          })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const askAI = async (q?: string): Promise<void> => {
    const query = q || question;
    if (!query) return;
    setQuestion(query);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      setAnswer("请求失败，请检查服务器状态。");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-10 gap-6 min-h-screen bg-gray-50 relative">
      <h1 className="text-4xl font-bold text-gray-800">AI 企业知识库</h1>

      <div className="relative w-[800px]">
        <input
          className="border p-3 w-[730px] rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="请输入你的问题..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={() => askAI()}
          className="absolute right-0 top-0 h-[50px] bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          提问
        </button>
      </div>

      {loading && <p className="text-gray-500">AI 正在思考...</p>}

      {answer && (
        <div className="border p-5 w-[800px] rounded shadow bg-white whitespace-pre-wrap">
          {answer}
        </div>
      )}

      {/* 固定右侧漂浮循环气泡 container */}
      <div className="absolute top-[100px] right-0 w-[300px] h-[500px] pointer-events-none">
        {bubbles.map(
          (b) =>
            b.visible && (
              <div
                key={b.id}
                onClick={() => askAI(b.text)}
                className="absolute cursor-pointer pointer-events-auto transition-all duration-100 ease-in-out"
                style={{
                  left: b.x,
                  top: b.y,
                }}
              >
                {/* 内层文字 */}
                <div className="relative z-10 px-4 py-2 bg-white rounded-full text-blue-800 font-medium shadow">
                  {b.text}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
