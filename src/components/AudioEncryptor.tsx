import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import { encryptAES, decryptAES } from "@/utils/encryption";
import { toast } from "sonner";
import { useCipher } from "@/contexts/CipherContext";
import { logActivity } from "@/utils/activityLogger";

function getIcon(name: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    mic: Mic,
    micOff: MicOff,
    play: Play,
    pause: Pause,
  };
  const IconComp = icons[name];
  return IconComp ? <IconComp className="h-6 w-6" /> : null;
}

const AudioEncryptor: React.FC = () => {
  const { isArabic } = useCipher();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [encryptedAudio, setEncryptedAudio] = useState("");
  const [decryptedAudioURL, setDecryptedAudioURL] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"encrypt"|"decrypt">("encrypt");
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // لغة بسيطة
  const TXT = {
    record: isArabic ? "تسجيل" : "Record",
    stop: isArabic ? "إيقاف" : "Stop",
    play: isArabic ? "تشغيل" : "Play",
    pause: isArabic ? "إيقاف مؤقت" : "Pause",
    encrypt: isArabic ? "تشفير وحفظ" : "Encrypt",
    decrypt: isArabic ? "فك تشفير وتشغيل" : "Decrypt",
    password: isArabic ? "كلمة المرور" : "Password",
    noAudio: isArabic ? "سجّل أو حمّل مقطع صوتي." : "Please record or upload an audio.",
    copy: isArabic ? "نسخ الشيفرة" : "Copy Cipher",
    chooseFile: isArabic ? "تحميل ملف صوتي" : "Upload Audio File",
  };

  // التسجيل الصوتي
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(isArabic ? "المتصفح لا يدعم التسجيل" : "Browser does not support recording");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      mediaRecorder.start();
      setRecording(true);
      toast.info(isArabic ? "يتم التسجيل..." : "Recording...");
    } catch {
      toast.error(isArabic ? "فشل بدء التسجيل" : "Failed to start recording");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    toast.success(isArabic ? "تم الحفظ" : "Recording saved");
  };

  // استيراد ملف صوتي
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioURL(URL.createObjectURL(file));
    }
  };

  // تشفير وحفظ الصوت
  const handleEncrypt = async () => {
    if (!audioBlob) {
      toast.error(TXT.noAudio);
      return;
    }
    if (!password) {
      toast.error(isArabic ? "يرجى إدخال كلمة مرور" : "Please enter a password");
      return;
    }
    const base64 = await blobToBase64(audioBlob);
    const cipher = encryptAES(base64, password);
    setEncryptedAudio(cipher);
    setDecryptedAudioURL(null);
    await logActivity({
      actionType: 'encrypt',
      resourceType: 'audio',
      resourceName: 'Audio Recording',
      status: 'success'
    });
    toast.success(isArabic ? "تم التشفير!" : "Audio encrypted!");
  };

  // فك تشفير الصوت
  const handleDecrypt = async () => {
    if (!encryptedAudio.trim()) {
      toast.error(isArabic ? "لا يوجد صوت مشفر" : "No encrypted audio available");
      return;
    }
    if (!password) {
      toast.error(isArabic ? "يرجى إدخال كلمة مرور" : "Please enter a password");
      return;
    }
    try {
      const plainBase64 = decryptAES(encryptedAudio, password);
      if (!plainBase64) throw new Error("Decryption failed");
      
      // Convert base64 back to blob
      const binaryString = atob(plainBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/webm" });
      setDecryptedAudioURL(URL.createObjectURL(blob));
      await logActivity({
        actionType: 'decrypt',
        resourceType: 'audio',
        resourceName: 'Audio Recording',
        status: 'success'
      });
      toast.success(isArabic ? "تم فك التشفير!" : "Audio decrypted!");
    } catch {
      await logActivity({
        actionType: 'decrypt',
        resourceType: 'audio',
        resourceName: 'Audio Recording',
        status: 'failed'
      });
      toast.error(isArabic ? "كلمة المرور أو المعطيات خاطئة" : "Wrong password or invalid data");
    }
  };

  // تشغيل الصوت بعد فك التشفير
  const handlePlay = () => {
    if (!decryptedAudioURL) return;
    setPlaying(true);
    audioRef.current?.play();
  };
  const handlePause = () => {
    setPlaying(false);
    audioRef.current?.pause();
  };

  // نسخ الشيفرة المشفرة
  const handleCopy = () => {
    if (!encryptedAudio) return;
    navigator.clipboard.writeText(encryptedAudio)
      .then(() => toast.success(TXT.copy))
      .catch(() => toast.error(isArabic ? "خطأ النسخ" : "Copy failed"));
  };

  // أدوات تحويل blob<->base64
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        res(base64);
      };
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  }
  function base64ToUint8Array(base64: string) {
    const bstr = atob(base64);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return u8arr;
  }

  return (
    <div className={`w-full max-w-2xl mx-auto glass-card p-5 mb-8 ${isArabic ? "rtl font-arabic" : ""}`}>
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">
          {isArabic ? "تشفير وفك تشفير الصوت" : "Audio Encrypt & Decrypt"}
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <Label>{TXT.chooseFile}</Label>
            <Input type="file" accept="audio/*" onChange={handleFile} disabled={recording}/>
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="button" onClick={recording ? stopRecording : startRecording} variant={recording? "destructive":"outline"}>
              {getIcon(recording ? "micOff" : "mic")}
              {recording ? TXT.stop : TXT.record}
            </Button>
            {audioURL && !recording && (
              <audio src={audioURL} controls className="ml-3 max-w-xs" />
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Label htmlFor="password">{TXT.password}</Label>
          <Input
            id="password"
            type="password"
            placeholder={TXT.password}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-3 my-4">
        <Button 
          variant={mode==="encrypt"?"default":"outline"}
          onClick={() => setMode("encrypt")}
        >
          {TXT.encrypt}
        </Button>
        <Button 
          variant={mode==="decrypt"?"default":"outline"}
          onClick={() => setMode("decrypt")}
        >
          {TXT.decrypt}
        </Button>
      </div>

      {/* تشفير */}
      {mode === "encrypt" ? (
        <>
          <Button className="w-full gap-2 my-1" onClick={handleEncrypt} disabled={!audioBlob || !password}>
            {TXT.encrypt}
          </Button>
          <div className="flex flex-col gap-1 mt-3">
            <Label>{isArabic ? "الشيفرة المشفرة" : "Encrypted Cipher"}</Label>
            <Textarea readOnly value={encryptedAudio} className="min-h-24 bg-muted/50" />
            {encryptedAudio && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>{TXT.copy}</Button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder={isArabic ? "الصق الشيفرة هنا" : "Paste cipher here"}
              className="min-h-24 bg-muted/50"
              value={encryptedAudio}
              onChange={e => setEncryptedAudio(e.target.value)}
            />
            <Button className="w-full gap-2" onClick={handleDecrypt} disabled={!encryptedAudio || !password}>
              {TXT.decrypt}
            </Button>
          </div>
          {decryptedAudioURL && (
            <div className="mt-4 flex flex-col items-center">
              <audio
                ref={audioRef}
                src={decryptedAudioURL}
                controls
                className="w-full max-w-xs"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              <Button
                className="mt-2"
                onClick={playing ? handlePause : handlePlay}
                disabled={!decryptedAudioURL}
              >
                {getIcon(playing ? "pause" : "play")}
                {playing ? TXT.pause : TXT.play}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AudioEncryptor;
