import React, { useCallback, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}

export default function PhotoUpload({ value, onChange, name, className }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB.");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Comprehensive compression using Canvas
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Get quality-controlled base64
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          onChange(dataUrl);
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden ring-4 ring-slate-100 ring-offset-4 transition-all group-hover:ring-primary/50 relative">
          <Avatar className="h-full w-full rounded-none">
            <AvatarImage src={value} className="object-cover" />
            <AvatarFallback className="text-3xl font-black bg-slate-50 text-slate-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}

          <label 
            className={cn(
               "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white",
               !value && "opacity-100 bg-black/5"
            )}
          >
            <Camera className="h-8 w-8 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {value ? "Change" : "Upload"}
            </span>
            <input 
               type="file" 
               className="hidden" 
               accept="image/*" 
               onChange={handleFileChange}
               disabled={isUploading}
            />
          </label>
        </div>

        {value && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg animate-in zoom-in duration-300"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {!value && !isUploading && (
        <div className="flex flex-col items-center text-center">
           <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter italic">Recommended: Square Photo (Max 5MB)</p>
        </div>
      )}
    </div>
  );
}
