import { useState } from "react";
import { Link, useRoute } from "wouter";
import { clsx } from "clsx";
import { format } from "date-fns";
import { useConversations } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, MessageCircle, Sparkles } from "lucide-react";
import { CreateConversationModal } from "./CreateConversationModal";
import { CuteRobot } from "./CuteRobot";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const [match, params] = useRoute("/c/:id");
  const activeId = match ? parseInt(params.id) : null;
  const { data: conversations, isLoading } = useConversations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className={clsx(
        "flex flex-col h-full w-full md:w-[300px] lg:w-[340px] flex-shrink-0 relative sidebar-bg border-r border-cyan-100",
        match ? "hidden md:flex" : "flex"
      )}>
        {/* Rainbow top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300" />

        {/* Header */}
        <div className="relative z-10 px-4 pt-4 pb-4 flex flex-col border-b border-cyan-100">
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo — robot on the LEFT */}
            <div className="flex-shrink-0">
              <CuteRobot mood="happy" size={72} floating={true} />
            </div>

            {/* Title + subtitle */}
            <div className="flex flex-col min-w-0">
              <h1 className="font-cute text-2xl font-black text-gradient-cyan leading-tight">
                Shul AI
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <p className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase truncate">Cute AI Friend</p>
                <Sparkles className="w-3 h-3 text-pink-400 flex-shrink-0" />
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full rounded-2xl h-11 font-bold text-sm text-white border-0 shadow-md"
              style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </motion.div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-2">
          {isLoading ? (
            <div className="space-y-3 mt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-cyan-100/60 animate-pulse" />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2">
              <MessageCircle className="w-10 h-10 text-cyan-300" />
              <p className="text-sm font-bold text-slate-400">No chats yet!</p>
              <p className="text-xs text-slate-300">Start your first conversation ☝️</p>
            </div>
          ) : (
            <AnimatePresence>
              {conversations?.map((conv, index) => {
                const isActive = activeId === conv.id;
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link href={`/c/${conv.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200",
                          isActive
                            ? "border border-cyan-300 shadow-md"
                            : "hover:bg-cyan-50 border border-transparent"
                        )}
                        style={isActive ? {
                          background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(236,72,153,0.06))",
                        } : {}}
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
                          style={{ background: isActive ? "linear-gradient(135deg,#e0f7fa,#b2ebf2)" : "#f0fdff" }}>
                          <span className="text-xl">🤖</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className={clsx("font-bold truncate pr-2 text-sm", isActive ? "text-cyan-700" : "text-slate-600")}>
                              {conv.title}
                            </h3>
                            <span className="text-[10px] text-slate-300 whitespace-nowrap">
                              {format(new Date(conv.createdAt), "MMM d")}
                            </span>
                          </div>
                          <p className={clsx("text-xs truncate font-medium", isActive ? "text-pink-400" : "text-slate-400")}>
                            {conv.characterName} ✨
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 p-4 border-t border-cyan-100 text-center">
          <p className="text-[10px] text-slate-300 tracking-widest uppercase font-semibold">
            Powered by OpenAI · Replit AI
          </p>
          <p className="text-[9px] text-pink-300 mt-0.5 font-bold">
            ✨ Created by Adhyan Sarthak ✨
          </p>
        </div>
      </div>

      <CreateConversationModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}
