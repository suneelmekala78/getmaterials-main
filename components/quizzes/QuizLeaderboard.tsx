import { Trophy } from "lucide-react";
import { resolveAvatarSrc } from "@/components/profile/FittedPhoto";

export type LeaderboardRow = {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  quizzes: number;
  attempts: number;
  avgScore: number;
  bestScore: number;
  /** Average best-attempt time in seconds (used as tie-break). */
  avgTimeSeconds?: number;
};

function formatAvgTime(seconds?: number) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

const rankStyles = [
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-slate-100 text-slate-600 border-slate-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];

export default function QuizLeaderboard({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Leaderboard</h3>
          <p className="text-[11px] text-slate-400">Score first, then faster times</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-slate-400 mt-4">No quiz attempts yet. Be the first on the board!</p>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((row, index) => {
            const isYou = currentUserId && row.id === currentUserId;
            const rank = index + 1;
            const avatar = resolveAvatarSrc(row.avatar, row.role);
            const timeLabel = formatAvgTime(row.avgTimeSeconds);
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${
                  isYou ? "bg-violet-50 ring-1 ring-violet-100" : "hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full border text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                    rankStyles[index] || "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {rank}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-slate-100 bg-white shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {row.name}
                    {isYou ? (
                      <span className="ml-1 text-[10px] font-bold text-violet-600">YOU</span>
                    ) : null}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {row.quizzes} quiz{row.quizzes === 1 ? "" : "zes"} · {row.attempts} attempt
                    {row.attempts === 1 ? "" : "s"}
                    {row.bestScore > 0 ? ` · best ${row.bestScore}%` : ""}
                    {timeLabel ? ` · ${timeLabel}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-violet-700">{row.avgScore}%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">avg</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
