import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCipher } from '@/contexts/CipherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Lock, FileX, Clock } from 'lucide-react';
import { decryptAES } from '@/utils/encryption';
import CryptoJS from 'crypto-js';

interface SharedFileData {
  id: string;
  file_name: string;
  encrypted_data: string;
  file_type: string;
  file_size: number;
  password_hash: string | null;
  expires_at: string;
  max_downloads: number | null;
  download_count: number;
  is_active: boolean;
}

const SharedFileView = () => {
  const { token } = useParams<{ token: string }>();
  const { isArabic } = useCipher();
  const { toast } = useToast();
  const [fileData, setFileData] = useState<SharedFileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = isArabic ? {
    title: 'ملف مشترك',
    description: 'قم بتنزيل الملف المشفر المشترك معك',
    fileName: 'اسم الملف',
    fileSize: 'حجم الملف',
    expiresAt: 'تنتهي الصلاحية في',
    downloads: 'التحميلات المتبقية',
    decryptionKey: 'مفتاح فك التشفير',
    decryptionKeyPlaceholder: 'أدخل مفتاح فك التشفير',
    sharePassword: 'كلمة مرور المشاركة',
    sharePasswordPlaceholder: 'أدخل كلمة مرور المشاركة',
    downloadButton: 'تنزيل الملف',
    downloading: 'جاري التنزيل...',
    notFound: 'الرابط غير موجود',
    expired: 'انتهت صلاحية الرابط',
    maxDownloadsReached: 'تم الوصول للحد الأقصى للتحميلات',
    downloadSuccess: 'تم تنزيل الملف بنجاح',
    downloadError: 'فشل تنزيل الملف',
    wrongKey: 'مفتاح فك التشفير غير صحيح',
    wrongPassword: 'كلمة المرور غير صحيحة',
    enterKey: 'يرجى إدخال مفتاح فك التشفير',
    enterPassword: 'يرجى إدخال كلمة المرور',
    unlimited: 'غير محدود',
  } : {
    title: 'Shared File',
    description: 'Download the encrypted file shared with you',
    fileName: 'File Name',
    fileSize: 'File Size',
    expiresAt: 'Expires At',
    downloads: 'Downloads Remaining',
    decryptionKey: 'Decryption Key',
    decryptionKeyPlaceholder: 'Enter decryption key',
    sharePassword: 'Share Password',
    sharePasswordPlaceholder: 'Enter share password',
    downloadButton: 'Download File',
    downloading: 'Downloading...',
    notFound: 'Link not found',
    expired: 'Link has expired',
    maxDownloadsReached: 'Maximum downloads reached',
    downloadSuccess: 'File downloaded successfully',
    downloadError: 'Failed to download file',
    wrongKey: 'Incorrect decryption key',
    wrongPassword: 'Incorrect password',
    enterKey: 'Please enter decryption key',
    enterPassword: 'Please enter password',
    unlimited: 'Unlimited',
  };

  useEffect(() => {
    fetchFileData();
  }, [token]);

  const fetchFileData = async () => {
    if (!token) {
      setError(text.notFound);
      setIsLoading(false);
      return;
    }

    try {
      // Use secure RPC function to fetch file data
      const { data, error } = await supabase
        .rpc('get_shared_file_by_token', { p_share_token: token });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError(text.notFound);
        return;
      }

      const fileInfo = data[0];
      
      // Check if active
      if (!fileInfo.is_active) {
        setError(text.notFound);
        return;
      }

      setFileData(fileInfo as SharedFileData);
    } catch (error) {
      console.error('Error fetching file:', error);
      setError(text.notFound);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileData) return;

    if (!decryptionKey.trim()) {
      toast({ title: text.enterKey, variant: 'destructive' });
      return;
    }

    if (fileData.password_hash && !sharePassword.trim()) {
      toast({ title: text.enterPassword, variant: 'destructive' });
      return;
    }

    setIsDownloading(true);

    try {
      // Verify password if required
      if (fileData.password_hash) {
        const enteredPasswordHash = CryptoJS.SHA256(sharePassword).toString();
        if (enteredPasswordHash !== fileData.password_hash) {
          toast({ title: text.wrongPassword, variant: 'destructive' });
          setIsDownloading(false);
          return;
        }
      }

      // Decrypt file data
      let decryptedData: string;
      try {
        decryptedData = decryptAES(fileData.encrypted_data, decryptionKey);
      } catch (error) {
        toast({ title: text.wrongKey, variant: 'destructive' });
        setIsDownloading(false);
        return;
      }

      // Convert base64 to blob and download
      const byteString = atob(decryptedData.split(',')[1]);
      const mimeString = decryptedData.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download count using secure RPC function
      await supabase.rpc('increment_download_count', { p_share_token: token });

      toast({ title: text.downloadSuccess });

      // Refresh data
      fetchFileData();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({ title: text.downloadError, variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <FileX className="w-6 h-6" />
              {text.notFound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-6 h-6" />
            {text.title}
          </CardTitle>
          <CardDescription>{text.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Info */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{text.fileName}:</span>
              <span className="text-sm font-medium">{fileData?.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{text.fileSize}:</span>
              <span className="text-sm font-medium">
                {fileData?.file_size ? formatFileSize(fileData.file_size) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{text.expiresAt}:</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {fileData?.expires_at ? formatDate(fileData.expires_at) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{text.downloads}:</span>
              <span className="text-sm font-medium">
                {fileData?.max_downloads
                  ? `${fileData.max_downloads - fileData.download_count}`
                  : text.unlimited}
              </span>
            </div>
          </div>

          {/* Password Input */}
          {fileData?.password_hash && (
            <div className="space-y-2">
              <Label>{text.sharePassword}</Label>
              <Input
                type="password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder={text.sharePasswordPlaceholder}
              />
            </div>
          )}

          {/* Decryption Key Input */}
          <div className="space-y-2">
            <Label>{text.decryptionKey}</Label>
            <Input
              type="password"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              placeholder={text.decryptionKeyPlaceholder}
            />
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? text.downloading : text.downloadButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedFileView;