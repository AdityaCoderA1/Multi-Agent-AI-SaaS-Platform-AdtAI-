import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  X
} from "lucide-react";
import { useEffect } from "react";
export default function AIBanner({
  open,
  title,
  message,
  onClose
}) {

    useEffect(()=>{

  if(!open) return;

  const timer=setTimeout(()=>{

      onClose();

  },5000);

  return ()=>clearTimeout(timer);

},[open]);

  return (

    <AnimatePresence>

      {open && (

        <motion.div

          initial={{
            y: -30,
            opacity: 0
          }}

          animate={{
            y: 0,
            opacity: 1
          }}

          exit={{
            y: -30,
            opacity: 0
          }}

          transition={{
            duration: .2
          }}

          className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-xl"

        >

          <div className="rounded-2xl border border-brand-primary/20 bg-brand-card shadow-2xl overflow-hidden">

            <div className="h-1 bg-gradient-to-r from-[#EA580C] to-amber-500" />

            <div className="flex items-start gap-4 p-5">

              <div className="w-10 h-10 rounded-xl bg-[#EA580C]/10 flex items-center justify-center shrink-0">

                <AlertTriangle
                  size={20}
                  className="text-[#EA580C]"
                />

              </div>

              <div className="flex-1">

                <h3 className="text-brand-text font-semibold text-[15px]">

                  {title}

                </h3>

                <p className="mt-1 text-brand-text-muted text-sm leading-6">

                  {message}

                </p>

              </div>

              <button

                onClick={onClose}

                className="text-brand-text-muted hover:text-brand-text"

              >

                <X size={18} />

              </button>

            </div>

          </div>

        </motion.div>

      )}

    </AnimatePresence>

  );

}