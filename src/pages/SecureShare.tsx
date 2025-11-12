import { useState, useEffect } from 'react';
import { useCipher } from '@/contexts/CipherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Share2, Copy, Trash2, ExternalLink, Mail, CalendarIcon, Clock, QrCode } from 'lucide-react';
import { encryptAES } from '@/utils/encryption';
import { logActivity } from '@/utils/activityLogger';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import CryptoJS from 'crypto-js';
import { QRCodeSVG } from 'qrcode.react';

interface SharedFile {
  id: string;
  file_name: string;
  share_token: string;
  expires_at: string;
  download_count: number;
  max_downloads: number | null;
  is_active: boolean;
  created_at: string;
}

const SecureShare = () => {
  const { isArabic } = useCipher();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [expiryHours, setExpiryHours] = useState('24');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [scheduleDelivery, setScheduleDelivery] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();

  const text = isArabic ? {
    title: 'المشاركة الآمنة',
    description: 'شارك ملفاتك المشفرة بأمان مع روابط محمية',
    selectFile: 'اختر ملف',
    encryptionKey: 'مفتاح التشفير',
    encryptionKeyPlaceholder: 'أدخل مفتاح التشفير',
    usePassword: 'حماية بكلمة مرور',
    sharePassword: 'كلمة مرور المشاركة',
    sharePasswordPlaceholder: 'كلمة مرور اختيارية للوصول',
    expiryTime: 'مدة الصلاحية',
    hours1: '1 ساعة',
    hours6: '6 ساعات',
    hours24: '24 ساعة',
    hours72: '3 أيام',
    hours168: 'أسبوع',
    maxDownloads: 'الحد الأقصى للتحميلات',
    maxDownloadsPlaceholder: 'اتركه فارغاً لعدد غير محدود',
    createLink: 'إنشاء رابط المشاركة',
    sendEmailNotification: 'إرسال إشعار بالبريد الإلكتروني',
    recipientEmail: 'بريد المستلم',
    recipientEmailPlaceholder: 'example@email.com',
    emailMessage: 'رسالة اختيارية',
    emailMessagePlaceholder: 'أضف رسالة للمستلم...',
    scheduleDelivery: 'جدولة الإرسال',
    scheduledDate: 'تاريخ الإرسال',
    scheduledTime: 'وقت الإرسال',
    pickDate: 'اختر التاريخ',
    scheduledFor: 'مجدول لـ',
    sendNow: 'إرسال فوري',
    recurrenceType: 'نوع التكرار',
    none: 'بدون تكرار',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    recurrenceEnd: 'نهاية التكرار',
    quickTemplates: 'قوالب سريعة',
    tomorrowMorning: 'غداً الصباح (9 ص)',
    afterWeek: 'بعد أسبوع',
    endOfMonth: 'نهاية الشهر',
    myShares: 'روابط المشاركة الخاصة بي',
    fileName: 'اسم الملف',
    expiresAt: 'تنتهي في',
    downloads: 'التحميلات',
    copyLink: 'نسخ الرابط',
    openLink: 'فتح الرابط',
    deleteLink: 'حذف الرابط',
    showQR: 'عرض QR Code',
    linkCopied: 'تم نسخ الرابط',
    linkDeleted: 'تم حذف الرابط',
    uploadSuccess: 'تم إنشاء رابط المشاركة بنجاح',
    uploadError: 'فشل إنشاء رابط المشاركة',
    selectFileFirst: 'يرجى اختيار ملف أولاً',
    enterKey: 'يرجى إدخال مفتاح التشفير',
    enterPassword: 'يرجى إدخال كلمة مرور المشاركة',
    active: 'نشط',
    expired: 'منتهي',
    unlimited: 'غير محدود',
    noShares: 'لا توجد روابط مشاركة بعد',
    fileSize: 'حجم الملف',
    createdAt: 'تاريخ الإنشاء',
  } : {
    title: 'Secure Share',
    description: 'Share your encrypted files securely with protected links',
    selectFile: 'Select File',
    encryptionKey: 'Encryption Key',
    encryptionKeyPlaceholder: 'Enter encryption key',
    usePassword: 'Password Protection',
    sharePassword: 'Share Password',
    sharePasswordPlaceholder: 'Optional password for access',
    expiryTime: 'Expiry Time',
    hours1: '1 Hour',
    hours6: '6 Hours',
    hours24: '24 Hours',
    hours72: '3 Days',
    hours168: '1 Week',
    maxDownloads: 'Max Downloads',
    maxDownloadsPlaceholder: 'Leave empty for unlimited',
    createLink: 'Create Share Link',
    sendEmailNotification: 'Send Email Notification',
    recipientEmail: 'Recipient Email',
    recipientEmailPlaceholder: 'example@email.com',
    emailMessage: 'Optional Message',
    emailMessagePlaceholder: 'Add a message for recipient...',
    scheduleDelivery: 'Schedule Delivery',
    scheduledDate: 'Send Date',
    scheduledTime: 'Send Time',
    pickDate: 'Pick a date',
    scheduledFor: 'Scheduled for',
    sendNow: 'Send Now',
    recurrenceType: 'Recurrence Type',
    none: 'No Recurrence',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    recurrenceEnd: 'Recurrence End',
    quickTemplates: 'Quick Templates',
    tomorrowMorning: 'Tomorrow Morning (9 AM)',
    afterWeek: 'After One Week',
    endOfMonth: 'End of Month',
    myShares: 'My Shared Links',
    fileName: 'File Name',
    expiresAt: 'Expires At',
    downloads: 'Downloads',
    copyLink: 'Copy Link',
    openLink: 'Open Link',
    deleteLink: 'Delete Link',
    showQR: 'Show QR Code',
    linkCopied: 'Link copied to clipboard',
    linkDeleted: 'Link deleted successfully',
    uploadSuccess: 'Share link created successfully',
    uploadError: 'Failed to create share link',
    selectFileFirst: 'Please select a file first',
    enterKey: 'Please enter encryption key',
    enterPassword: 'Please enter share password',
    active: 'Active',
    expired: 'Expired',
    unlimited: 'Unlimited',
    noShares: 'No shared links yet',
    fileSize: 'File Size',
    createdAt: 'Created At',
  };

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedFiles(data || []);
    } catch (error) {
      console.error('Error fetching shared files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateShare = async () => {
    if (!file) {
      toast({ title: text.selectFileFirst, variant: 'destructive' });
      return;
    }

    if (!encryptionKey.trim()) {
      toast({ title: text.enterKey, variant: 'destructive' });
      return;
    }

    if (usePassword && !sharePassword.trim()) {
      toast({ title: text.enterPassword, variant: 'destructive' });
      return;
    }

    if (sendEmail) {
      if (!recipientEmail.trim()) {
        toast({ title: text.enterPassword, variant: 'destructive' });
        return;
      }

      if (scheduleDelivery && !scheduledDate) {
        toast({ 
          title: isArabic ? 'يرجى اختيار تاريخ الإرسال' : 'Please select send date',
          variant: 'destructive' 
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Read file as base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Encrypt file data
      const encryptedData = encryptAES(fileData, encryptionKey);

      // Hash share password if provided
      let passwordHash = null;
      if (usePassword && sharePassword) {
        passwordHash = CryptoJS.SHA256(sharePassword).toString();
      }

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours));

      // Calculate scheduled send time if scheduled
      let scheduledSendAt = null;
      let nextSendAt = null;
      if (sendEmail && scheduleDelivery && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        scheduledSendAt = new Date(scheduledDate);
        scheduledSendAt.setHours(hours, minutes, 0, 0);
        
        // Set next_send_at for recurring schedules
        if (recurrenceType !== 'none') {
          nextSendAt = scheduledSendAt;
        }
      }

      // Prepare details object with recipient info
      const details: any = {};
      if (sendEmail && recipientEmail.trim()) {
        details.recipient_email = recipientEmail.trim();
        if (emailMessage.trim()) {
          details.message = emailMessage.trim();
        }
      }

      // Insert into database
      const { data, error } = await supabase
        .from('shared_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          encrypted_data: encryptedData,
          file_type: file.type,
          file_size: file.size,
          password_hash: passwordHash,
          expires_at: expiresAt.toISOString(),
          max_downloads: maxDownloads ? parseInt(maxDownloads) : null,
          scheduled_send_at: scheduledSendAt?.toISOString() || null,
          recurrence_type: recurrenceType,
          recurrence_end_date: recurrenceEndDate?.toISOString() || null,
          next_send_at: nextSendAt?.toISOString() || null,
          details: Object.keys(details).length > 0 ? details : null,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        actionType: 'encrypt',
        resourceType: 'file',
        resourceName: file.name,
        status: 'success'
      });

      toast({ title: text.uploadSuccess });

      // Send email notification if requested and not scheduled
      if (sendEmail && recipientEmail.trim() && !scheduleDelivery) {
        try {
          await supabase.functions.invoke('send-share-notification', {
            body: {
              shareId: data.id,
              recipientEmail: recipientEmail.trim(),
              message: emailMessage.trim()
            }
          });
          toast({ title: isArabic ? 'تم إرسال الإشعار بنجاح' : 'Notification sent successfully' });
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          toast({ 
            title: isArabic ? 'فشل إرسال الإشعار' : 'Failed to send notification',
            variant: 'destructive'
          });
        }
      } else if (sendEmail && scheduleDelivery) {
        toast({ 
          title: isArabic ? 'تم جدولة الإرسال بنجاح' : 'Delivery scheduled successfully',
          description: isArabic 
            ? `سيتم الإرسال في ${format(scheduledDate!, 'PPP')} الساعة ${scheduledTime}`
            : `Will be sent on ${format(scheduledDate!, 'PPP')} at ${scheduledTime}`
        });
      }
      
      // Reset form
      setFile(null);
      setEncryptionKey('');
      setSharePassword('');
      setUsePassword(false);
      setMaxDownloads('');
      setRecipientEmail('');
      setEmailMessage('');
      setSendEmail(false);
      setScheduleDelivery(false);
      setScheduledDate(undefined);
      setScheduledTime('12:00');
      setRecurrenceType('none');
      setRecurrenceEndDate(undefined);
      
      // Refresh list
      fetchSharedFiles();
    } catch (error) {
      console.error('Error creating share:', error);
      toast({ title: text.uploadError, variant: 'destructive' });
      await logActivity({
        actionType: 'encrypt',
        resourceType: 'file',
        resourceName: file.name,
        status: 'failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyShareLink = (token: string) => {
    const link = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: text.linkCopied });
  };

  const openShareLink = (token: string) => {
    window.open(`/shared/${token}`, '_blank');
  };

  const deleteShare = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: text.linkDeleted });
      fetchSharedFiles();
    } catch (error) {
      console.error('Error deleting share:', error);
      toast({ title: 'Error deleting link', variant: 'destructive' });
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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const applyQuickTemplate = (template: string) => {
    const now = new Date();
    let newDate = new Date();
    let newTime = '09:00';

    switch (template) {
      case 'tomorrow':
        newDate.setDate(now.getDate() + 1);
        newDate.setHours(9, 0, 0, 0);
        break;
      case 'week':
        newDate.setDate(now.getDate() + 7);
        newDate.setHours(9, 0, 0, 0);
        break;
      case 'month':
        newDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        newDate.setHours(18, 0, 0, 0);
        newTime = '18:00';
        break;
    }

    setScheduledDate(newDate);
    setScheduledTime(newTime);
    setScheduleDelivery(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Create Share Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              {text.title}
            </CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Selection */}
            <div className="space-y-2">
              <Label>{text.selectFile}</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <Button variant="outline" onClick={() => setFile(null)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  {file.name} ({formatFileSize(file.size)})
                </p>
              )}
            </div>

            {/* Encryption Key */}
            <div className="space-y-2">
              <Label>{text.encryptionKey}</Label>
              <Input
                type="password"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder={text.encryptionKeyPlaceholder}
              />
            </div>

            {/* Password Protection */}
            <div className="flex items-center justify-between">
              <Label>{text.usePassword}</Label>
              <Switch checked={usePassword} onCheckedChange={setUsePassword} />
            </div>

            {usePassword && (
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

            {/* Expiry Time */}
            <div className="space-y-2">
              <Label>{text.expiryTime}</Label>
              <Select value={expiryHours} onValueChange={setExpiryHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{text.hours1}</SelectItem>
                  <SelectItem value="6">{text.hours6}</SelectItem>
                  <SelectItem value="24">{text.hours24}</SelectItem>
                  <SelectItem value="72">{text.hours72}</SelectItem>
                  <SelectItem value="168">{text.hours168}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Downloads */}
            <div className="space-y-2">
              <Label>{text.maxDownloads}</Label>
              <Input
                type="number"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                placeholder={text.maxDownloadsPlaceholder}
                min="1"
              />
            </div>

            {/* Email Notification */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {text.sendEmailNotification}
              </Label>
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </div>

            {sendEmail && (
              <>
                <div className="space-y-2">
                  <Label>{text.recipientEmail}</Label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder={text.recipientEmailPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{text.emailMessage}</Label>
                  <Textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder={text.emailMessagePlaceholder}
                  rows={3}
                  />
                </div>

                {/* Schedule Delivery */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {text.scheduleDelivery}
                  </Label>
                  <Switch checked={scheduleDelivery} onCheckedChange={setScheduleDelivery} />
                </div>

                {scheduleDelivery && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{text.scheduledDate}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, "PPP") : <span>{text.pickDate}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>{text.scheduledTime}</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>

                    {/* Quick Templates */}
                    <div className="space-y-2">
                      <Label>{text.quickTemplates}</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyQuickTemplate('tomorrow')}
                        >
                          {text.tomorrowMorning}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyQuickTemplate('week')}
                        >
                          {text.afterWeek}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyQuickTemplate('month')}
                        >
                          {text.endOfMonth}
                        </Button>
                      </div>
                    </div>

                    {/* Recurrence Type */}
                    <div className="space-y-2">
                      <Label>{text.recurrenceType}</Label>
                      <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{text.none}</SelectItem>
                          <SelectItem value="daily">{text.daily}</SelectItem>
                          <SelectItem value="weekly">{text.weekly}</SelectItem>
                          <SelectItem value="monthly">{text.monthly}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Recurrence End Date */}
                    {recurrenceType !== 'none' && (
                      <div className="space-y-2">
                        <Label>{text.recurrenceEnd}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !recurrenceEndDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : <span>{text.pickDate}</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={recurrenceEndDate}
                              onSelect={setRecurrenceEndDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreateShare}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'جاري الإنشاء...' : text.createLink}
            </Button>
          </CardContent>
        </Card>

        {/* Shared Files List */}
        <Card>
          <CardHeader>
            <CardTitle>{text.myShares}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground">جاري التحميل...</p>
            ) : sharedFiles.length === 0 ? (
              <p className="text-center text-muted-foreground">{text.noShares}</p>
            ) : (
              <div className="space-y-3">
                {sharedFiles.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{share.file_name}</p>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <p>
                          {text.expiresAt}: {formatDate(share.expires_at)}
                        </p>
                        <p>
                          {text.downloads}: {share.download_count} / {share.max_downloads || text.unlimited}
                        </p>
                        <p className={isExpired(share.expires_at) ? 'text-destructive' : 'text-green-600'}>
                          {isExpired(share.expires_at) ? text.expired : text.active}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            title={text.showQR}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{text.showQR}</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center p-6 space-y-4">
                            <div className="bg-white p-4 rounded-lg">
                              <QRCodeSVG
                                value={`${window.location.origin}/shared/${share.share_token}`}
                                size={256}
                                level="H"
                                includeMargin
                              />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                              {share.file_name}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyShareLink(share.share_token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openShareLink(share.share_token)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteShare(share.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecureShare;