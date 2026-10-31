import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData, setTheme } from "../redux/user.slice";

export default function SettingsModal({ isOpen, onClose }) {
  const { userData, theme } = useSelector(state => state.user);
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userData && isOpen) {
      setInstructions(userData.customInstructions || "");
    }
  }, [userData, theme, isOpen]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await api.patch("/api/auth/internal/update-instructions", {
        userId: userData._id,
        customInstructions: instructions
      });
      if (res.data.success) {
        dispatch(setUserData({ ...userData, customInstructions: instructions }));
        onClose();
      }
    } catch (error) {
      console.error("Failed to save instructions", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-brand-border flex justify-between items-center">
          <h2 className="text-brand-text font-medium text-lg">Settings</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text transition-colors cursor-pointer p-1 rounded-md hover:bg-brand-bg">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Appearance Section */}
          <div>
            <h3 className="text-brand-text text-[15px] font-medium mb-1">Appearance</h3>
            <p className="text-brand-text-muted text-[13px] mb-3 leading-relaxed">
              Customize the look and feel of your workspace.
            </p>
            <div className="flex bg-brand-bg border border-brand-border rounded-lg p-1">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch(setTheme(t))}
                  className={`flex-1 py-1.5 text-[13px] font-medium rounded-md capitalize transition-colors ${
                    (theme || 'system') === t 
                      ? "bg-brand-card text-brand-text shadow-sm" 
                      : "text-brand-text-muted hover:text-brand-text"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-brand-border" />

          {/* Instructions Section */}
          <div>
            <h3 className="text-brand-text text-[15px] font-medium mb-1">Custom Instructions</h3>
            <p className="text-brand-text-muted text-[13px] mb-3 leading-relaxed">
              What would you like adtAI to know about you to provide better responses? How would you like adtAI to respond?
            </p>
            <textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. I am a frontend developer. Always write code in React using Tailwind CSS. Keep your answers brief and concise."
              className="w-full h-40 bg-brand-bg border border-brand-border rounded-xl p-3 text-[14px] text-brand-text placeholder-brand-text-muted focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-brand-border flex justify-end gap-3 bg-brand-sidebar-bg">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-brand-text-muted hover:text-brand-text transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-brand-primary text-white text-[13px] font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
