import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, Smile } from "lucide-react"; // optional lucide icons

/**
 * PostForm
 * Props:
 *  - onPostCreated: function() -> called after successful post
 *
 * Notes:
 *  - If user picks images, the request is sent as FormData.
 *  - Default placeholder preview uses the uploaded file path:
 *      /mnt/data/f89ec2e2-ea28-4fc3-8a59-0f740bf9b5e4.png
 */

const EMOJIS = ["😀","😂","😍","🔥","🎉","👍","💜","👏","🤝","😅","😎"];

export default function PostForm({ onPostCreated = () => {} }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // { file, url }
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

  // auto-resize textarea
  const textareaRef = useRef(null);
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [content]);

  // helper: add images from FileList
  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList).slice(0, 4); // limit to 4
    const mapped = arr.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...mapped].slice(0, 4)); // keep max 4
  }, []);

  // drag/drop handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onPickFiles = (e) => {
    if (e.target.files && e.target.files.length) handleFiles(e.target.files);
    e.target.value = null;
  };

  const removeImage = (index) => {
    const toRevoke = images[index]?.url;
    if (toRevoke) URL.revokeObjectURL(toRevoke);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // insert emoji at caret position
  const insertEmoji = (emoji) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((c) => c + emoji);
      return;
    }
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const newText = content.slice(0, start) + emoji + content.slice(end);
    setContent(newText);
    // move caret after emoji (next tick)
    setTimeout(() => {
      ta.focus();
      const pos = start + emoji.length;
      ta.selectionStart = ta.selectionEnd = pos;
    }, 0);
  };

  // submit handler: FormData if images exist otherwise JSON
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      return alert("Write something or add an image.");
    }

    setLoading(true);
    try {
      let res;
      if (images.length > 0) {
        const fd = new FormData();
        fd.append("content", content);
        images.forEach((imgObj, idx) => fd.append("images", imgObj.file));
        res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/post/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: fd,
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/post/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content }),
        });
      }

      if (res.ok) {
        setContent("");
        images.forEach(img => img.url && URL.revokeObjectURL(img.url));
        setImages([]);
        onPostCreated();
       
        toast.success("Thread has been Posted!");
      } else {
        const err = await res.json().catch(()=>null);
        console.error("Post error", err);
        alert(err?.message || "Failed to create post.");
      }
    } catch (err) {
      console.error("Network or server error", err);
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto mt-8 p-5 rounded-2xl bg-gradient-to-br from-purple-600/30 to-purple-400/20 border border-white/10 backdrop-blur-md shadow-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {/* avatar / placeholder */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white font-semibold shadow-md">
              { (localStorage.getItem("username") || "U").charAt(0).toUpperCase() }
            </div>
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what you're thinking..."
              className="w-full min-h-[60px] max-h-72 p-3 bg-white/6 text-white placeholder-white/60 border border-white/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition"
              rows={3}
              maxLength={500}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {/* file input (hidden) */}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickFiles}
                  className="hidden"
                />

                <label
                  onClick={() => inputRef.current && inputRef.current.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-white/6 hover:bg-white/8 transition text-white text-sm"
                  title="Add images"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Add photo</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowEmoji((s) => !s)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/6 hover:bg-white/8 transition text-white text-sm"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                  <span className="hidden sm:inline">Emoji</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-purple-200 hidden sm:block">{content.length}/500</div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow hover:opacity-95 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Post"}
                </button>
              </div>
            </div>

            {/* small emoji picker popover */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 p-3 bg-white/8 rounded-xl border border-white/10 shadow-lg w-full max-w-[320px]"
                >
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => { insertEmoji(em); setShowEmoji(false); }}
                        className="text-2xl p-1 rounded-md hover:bg-white/10 transition"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Drag & Drop area + previews */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`mt-2 p-3 rounded-xl border-2 transition ${
            dragOver ? "border-dashed border-white/30 bg-white/6" : "border-transparent"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">Drag & drop images here, or click <span className="font-medium">Add photo</span></div>

            <div className="text-xs text-white/50">Max 4 images</div>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* default placeholder preview if no images */}
            {images.length === 0 ? (
              <div className="col-span-full rounded-lg overflow-hidden border border-white/8 bg-white/4 p-4 flex items-center justify-center">
                <img
                  src="https://via.placeholder.com/150"
                  alt="placeholder"
                  className="max-h-28 object-contain opacity-80"
                />
              </div>
            ) : (
              images.map((img, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden">
                  <img src={img.url} alt={`preview-${idx}`} className="object-cover w-full h-36" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-white/20 text-white p-1 rounded-full hover:bg-white/30"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
}



