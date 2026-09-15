import { useRoute } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { CuteRobot } from "@/components/CuteRobot";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ChatPage() {
  const [match, params] = useRoute("/c/:id");
  const activeId = match ? parseInt(params.id) : null;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #f0fdff 40%, #fce4ec 85%, #fffde7 100%)" }}>
      <Sidebar />

      <main className={`flex-1 h-full relative ${!activeId ? "hidden md:flex" : "flex"}`}>
        {activeId ? (
          <ChatArea id={activeId} />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center h-full relative overflow-hidden">

            {/* Bg blobs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-16 right-24 w-48 h-48 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
              <div className="absolute bottom-24 left-16 w-40 h-40 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
              <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-5 relative z-10"
            >
              {/* Big floating robot */}
              <CuteRobot mood="happy" size={200} floating={true} />

              <div className="text-center max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-3xl font-cute font-black text-gradient-cyan">Shul AI</h2>
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-slate-400 text-sm font-medium mt-1">Your cute AI friend is ready to help! 🌸</p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    { emoji: "💬", label: "Smart Chat", color: "bg-cyan-100 text-cyan-600" },
                    { emoji: "🎨", label: "AI Images", color: "bg-pink-100 text-pink-600" },
                    { emoji: "🔊", label: "Voice Reply", color: "bg-yellow-100 text-yellow-600" },
                    { emoji: "🔒", label: "Private", color: "bg-green-100 text-green-600" },
                  ].map(f => (
                    <motion.span
                      key={f.label}
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${f.color} shadow-sm`}
                    >
                      {f.emoji} {f.label}
                    </motion.span>
                  ))}
                </div>

                <p className="text-[10px] text-slate-300 mt-5 tracking-widest uppercase font-semibold">
                  Created by Adhyan Sarthak
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
