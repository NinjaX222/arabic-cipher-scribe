import { useState, useRef, useEffect } from "react";
import { FolderOpen, Upload, Download, Lock, Unlock, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCipher } from "@/contexts/CipherContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { encryptAES, decryptAES } from "@/utils/encryption";
import { logActivity } from "@/utils/activityLogger";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  encryptedData?: string;
  errorMessage?: string;
}

const BatchProcessing = () => {
  const { isArabic } = useCipher();
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [password, setPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logActivity({
      actionType: 'encrypt',
      resourceType: 'file',
      resourceName: 'Batch Processing Page'
    });
  }, []);

  const text = isArabic ? {
    title: "المعالجة الدفعية",
    subtitle: "تشفير وفك تشفير ملفات متعددة دفعة واحدة",
    selectFiles: "اختر ملفات",
    selectFolder: "اختر مجلد",
    password: "كلمة المرور",
    encryptAll: "تشفير الكل",
    decryptAll: "فك تشفير الكل",
    clearAll: "مسح الكل",
    downloadAll: "تحميل الكل",
    dragDrop: "اسحب الملفات أو المجلدات هنا",
    noFiles: "لا توجد ملفات",
    status: "الحالة",
    pending: "في الانتظار",
    processing: "جاري المعالجة",
    success: "نجح",
    error: "فشل",
    fileName: "اسم الملف",
    fileSize: "الحجم",
    actions: "الإجراءات",
    encrypt: "تشفير",
    decrypt: "فك التشفير",
    download: "تحميل",
    remove: "حذف",
    passwordRequired: "يرجى إدخال كلمة المرور",
    selectFilesFirst: "يرجى اختيار ملفات أولاً",
    batchComplete: "اكتملت المعالجة الدفعية",
    filesEncrypted: "تم تشفير {count} ملف",
    filesDecrypted: "تم فك تشفير {count} ملف",
    processingStopped: "توقفت المعالجة",
    totalFiles: "إجمالي الملفات",
    completed: "مكتمل",
    failed: "فشل"
  } : {
    title: "Batch Processing",
    subtitle: "Encrypt and decrypt multiple files at once",
    selectFiles: "Select Files",
    selectFolder: "Select Folder",
    password: "Password",
    encryptAll: "Encrypt All",
    decryptAll: "Decrypt All",
    clearAll: "Clear All",
    downloadAll: "Download All",
    dragDrop: "Drag files or folders here",
    noFiles: "No files",
    status: "Status",
    pending: "Pending",
    processing: "Processing",
    success: "Success",
    error: "Error",
    fileName: "File Name",
    fileSize: "Size",
    actions: "Actions",
    encrypt: "Encrypt",
    decrypt: "Decrypt",
    download: "Download",
    remove: "Remove",
    passwordRequired: "Please enter a password",
    selectFilesFirst: "Please select files first",
    batchComplete: "Batch processing complete",
    filesEncrypted: "{count} files encrypted",
    filesDecrypted: "{count} files decrypted",
    processingStopped: "Processing stopped",
    totalFiles: "Total Files",
    completed: "Completed",
    failed: "Failed"
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newFileItems: FileItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
      progress: 0
    }));
    setFileItems(prev => [...prev, ...newFileItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];
    
    items.forEach((item) => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    });
    
    addFiles(files);
  };

  const encryptFile = async (fileItem: FileItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 50;
          setFileItems(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        }
      };
      
      reader.onload = async (e) => {
        try {
          const fileData = {
            name: fileItem.file.name,
            type: fileItem.file.type,
            size: fileItem.file.size,
            data: e.target?.result as string
          };
          
          setFileItems(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: 75 } : f
          ));
          
          const encrypted = encryptAES(JSON.stringify(fileData), password);
          
          setFileItems(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              progress: 100, 
              status: 'success',
              encryptedData: encrypted 
            } : f
          ));
          
          resolve();
        } catch (error) {
          setFileItems(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'error',
              errorMessage: 'Encryption failed'
            } : f
          ));
          reject(error);
        }
      };
      
      reader.onerror = () => {
        setFileItems(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error',
            errorMessage: 'Failed to read file'
          } : f
        ));
        reject(new Error('File read error'));
      };
      
      reader.readAsDataURL(fileItem.file);
    });
  };

  const handleEncryptAll = async () => {
    if (!password) {
      toast.error(text.passwordRequired);
      return;
    }
    
    if (fileItems.length === 0) {
      toast.error(text.selectFilesFirst);
      return;
    }

    setIsProcessingBatch(true);
    
    // Reset all pending files
    setFileItems(prev => prev.map(f => ({
      ...f,
      status: f.status === 'success' ? f.status : 'processing',
      progress: f.status === 'success' ? 100 : 0
    })));

    let successCount = 0;
    let failCount = 0;

    for (const fileItem of fileItems) {
      if (fileItem.status !== 'success') {
        try {
          await encryptFile(fileItem);
          successCount++;
        } catch (error) {
          failCount++;
        }
      } else {
        successCount++;
      }
    }

    setIsProcessingBatch(false);
    
    await logActivity({
      actionType: 'encrypt',
      resourceType: 'file',
      resourceName: `${successCount} files`,
      status: failCount > 0 ? 'failed' : 'success'
    });
    
    toast.success(text.filesEncrypted.replace('{count}', successCount.toString()));
    
    if (failCount > 0) {
      toast.error(`${failCount} ${isArabic ? 'ملف فشل' : 'files failed'}`);
    }
  };

  const handleEncryptSingle = async (fileItem: FileItem) => {
    if (!password) {
      toast.error(text.passwordRequired);
      return;
    }

    setFileItems(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'processing', progress: 0 } : f
    ));

    try {
      await encryptFile(fileItem);
      
      await logActivity({
        actionType: 'encrypt',
        resourceType: 'file',
        resourceName: fileItem.file.name,
        status: 'success'
      });
      
      toast.success(`${fileItem.file.name} ${isArabic ? 'تم تشفيره' : 'encrypted'}`);
    } catch (error) {
      await logActivity({
        actionType: 'encrypt',
        resourceType: 'file',
        resourceName: fileItem.file.name,
        status: 'failed'
      });
      toast.error(`${fileItem.file.name} ${isArabic ? 'فشل التشفير' : 'encryption failed'}`);
    }
  };

  const handleDownload = (fileItem: FileItem) => {
    if (!fileItem.encryptedData) return;
    
    const blob = new Blob([fileItem.encryptedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileItem.file.name}.encrypted`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(isArabic ? 'تم التحميل' : 'Downloaded');
  };

  const handleDownloadAll = () => {
    const successFiles = fileItems.filter(f => f.status === 'success' && f.encryptedData);
    
    if (successFiles.length === 0) {
      toast.error(isArabic ? 'لا توجد ملفات مشفرة للتحميل' : 'No encrypted files to download');
      return;
    }
    
    successFiles.forEach(fileItem => {
      handleDownload(fileItem);
    });
    
    toast.success(`${successFiles.length} ${isArabic ? 'ملف تم تحميله' : 'files downloaded'}`);
  };

  const handleRemove = (id: string) => {
    setFileItems(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAll = () => {
    setFileItems([]);
    setPassword('');
    toast.success(isArabic ? 'تم المسح' : 'Cleared');
  };

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: FileItem['status']) => {
    const variants: Record<FileItem['status'], any> = {
      pending: 'secondary',
      processing: 'default',
      success: 'default',
      error: 'destructive'
    };
    
    const labels: Record<FileItem['status'], string> = {
      pending: text.pending,
      processing: text.processing,
      success: text.success,
      error: text.error
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const stats = {
    total: fileItems.length,
    completed: fileItems.filter(f => f.status === 'success').length,
    failed: fileItems.filter(f => f.status === 'error').length,
    pending: fileItems.filter(f => f.status === 'pending').length
  };

  return (
    <div className={`min-h-screen ${isArabic ? "rtl font-arabic" : ""}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{text.title}</h1>
          </div>
          <p className="text-muted-foreground">{text.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {text.totalFiles}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {text.completed}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {text.pending}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {text.failed}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{isArabic ? "التحكم" : "Controls"}</CardTitle>
              <CardDescription>{isArabic ? "إدارة الملفات والعمليات" : "Manage files and operations"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Selection */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{text.dragDrop}</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore - webkitdirectory is not in types
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                className="hidden"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {text.selectFiles}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {text.selectFolder}
                </Button>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">{text.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={handleEncryptAll}
                  disabled={isProcessingBatch || fileItems.length === 0}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {text.encryptAll}
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleDownloadAll}
                  disabled={stats.completed === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {text.downloadAll}
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={fileItems.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {text.clearAll}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Files List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{isArabic ? "قائمة الملفات" : "Files List"}</CardTitle>
              <CardDescription>
                {fileItems.length > 0 
                  ? `${fileItems.length} ${isArabic ? 'ملف' : 'file(s)'}`
                  : text.noFiles
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {fileItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{text.noFiles}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fileItems.map((fileItem) => (
                      <Card key={fileItem.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* File Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {getStatusIcon(fileItem.status)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{fileItem.file.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatFileSize(fileItem.file.size)}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(fileItem.status)}
                            </div>

                            {/* Progress Bar */}
                            {fileItem.status === 'processing' && (
                              <Progress value={fileItem.progress} className="h-2" />
                            )}

                            {/* Error Message */}
                            {fileItem.status === 'error' && fileItem.errorMessage && (
                              <div className="text-sm text-destructive">
                                {fileItem.errorMessage}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {fileItem.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEncryptSingle(fileItem)}
                                  disabled={!password}
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  {text.encrypt}
                                </Button>
                              )}
                              
                              {fileItem.status === 'success' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(fileItem)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {text.download}
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(fileItem.id)}
                                disabled={fileItem.status === 'processing'}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {text.remove}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BatchProcessing;