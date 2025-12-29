import { Trophy, Award, Target, Star, Zap } from "lucide-react";
import { motion } from "motion/react";

const achievements = [
  { icon: Trophy, label: "100 Valoraciones", unlocked: true },
  { icon: Award, label: "Mes Perfecto", unlocked: true },
  { icon: Target, label: "USD 1M Procesado", unlocked: true },
  { icon: Star, label: "Nivel Experto", unlocked: true },
  { icon: Zap, label: "Maestro de Velocidad", unlocked: false },
];

export function AchievementCard() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const percentage = (unlockedCount / totalCount) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="p-6 rounded-2xl border border-white/10 relative overflow-hidden h-full"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c4a159]/10 blur-3xl rounded-full" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl mb-1 text-white font-bold">Logros</h3>
            <p className="text-sm text-white/60">
              {unlockedCount} de {totalCount} desbloqueados
            </p>
          </div>

          {/* Circular progress */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#c4a159"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDashoffset={circumference}
                strokeDasharray={`${circumference} ${circumference}`}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#c4a159]">
              {Math.round(percentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Achievement badges */}
        <div className="grid grid-cols-5 gap-3 mt-auto">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.7 + index * 0.1,
                  type: "spring",
                }}
                className="group relative"
              >
                <div
                  className={`
                    w-full aspect-square rounded-xl flex items-center justify-center border
                    transition-all duration-200 cursor-pointer
                    ${
                      achievement.unlocked
                        ? "bg-[#c4a159]/10 border-[#c4a159]/30 hover:bg-[#c4a159]/20"
                        : "bg-white/5 border-white/10 opacity-40"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      achievement.unlocked ? "text-[#c4a159]" : "text-white/30"
                    }`}
                  />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0d1b2a] border border-white/10 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {achievement.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
