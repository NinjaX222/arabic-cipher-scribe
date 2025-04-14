
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KeyRound, Plus, Trash, Copy, Check, Key } from "lucide-react";
import { useCipher } from "@/contexts/CipherContext";
import { Badge } from "@/components/ui/badge";

interface KeyManagerTexts {
  title: string;
  description: string;
  noKeys: string;
  addKey: string;
  keyId: string;
  keyIdPlaceholder: string;
  keyValue: string;
  keyValuePlaceholder: string;
  expiration: string;
  generate: string;
  save: string;
  cancel: string;
  expiresOn: string;
  copyKey: string;
  deleteKey: string;
  keyCopied: string;
  keyDeleted: string;
  expired: string;
}

const englishText: KeyManagerTexts = {
  title: "Key Management",
  description: "Create, view and manage your encryption keys",
  noKeys: "No keys stored. Create a new key to get started.",
  addKey: "Add New Key",
  keyId: "Key ID",
  keyIdPlaceholder: "Enter a name for this key",
  keyValue: "Key Value",
  keyValuePlaceholder: "Enter key or generate one",
  expiration: "Expiration (hours)",
  generate: "Generate Random Key",
  save: "Save Key",
  cancel: "Cancel",
  expiresOn: "Expires on",
  copyKey: "Copy Key",
  deleteKey: "Delete",
  keyCopied: "Key copied to clipboard",
  keyDeleted: "Key deleted successfully",
  expired: "Expired",
};

const arabicText: KeyManagerTexts = {
  title: "إدارة المفاتيح",
  description: "إنشاء وعرض وإدارة مفاتيح التشفير الخاصة بك",
  noKeys: "لا توجد مفاتيح مخزنة. قم بإنشاء مفتاح جديد للبدء.",
  addKey: "إضافة مفتاح جديد",
  keyId: "معرف المفتاح",
  keyIdPlaceholder: "أدخل اسمًا لهذا المفتاح",
  keyValue: "قيمة المفتاح",
  keyValuePlaceholder: "أدخل المفتاح أو قم بإنشاء واحد",
  expiration: "انتهاء الصلاحية (ساعات)",
  generate: "توليد مفتاح عشوائي",
  save: "حفظ المفتاح",
  cancel: "إلغاء",
  expiresOn: "ينتهي في",
  copyKey: "نسخ المفتاح",
  deleteKey: "حذف",
  keyCopied: "تم نسخ المفتاح إلى الحافظة",
  keyDeleted: "تم حذف المفتاح بنجاح",
  expired: "منتهي الصلاحية",
};

const KeyManager: React.FC = () => {
  const { isArabic, keys, addKey, removeKey, generateNewKey } = useCipher();
  const text = isArabic ? arabicText : englishText;
  
  const [newKeyId, setNewKeyId] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [expirationHours, setExpirationHours] = useState("24");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddKey = () => {
    if (!newKeyId) {
      toast.error(isArabic ? "يرجى إدخال معرف المفتاح" : "Please enter a key ID");
      return;
    }

    if (!newKeyValue) {
      toast.error(isArabic ? "يرجى إدخال قيمة المفتاح أو توليد واحدة" : "Please enter a key value or generate one");
      return;
    }

    addKey(newKeyId, newKeyValue, parseInt(expirationHours, 10) || 24);
    setNewKeyId("");
    setNewKeyValue("");
    setExpirationHours("24");
    setIsDialogOpen(false);
  };

  const handleGenerateKey = () => {
    const generatedKey = generateNewKey(newKeyId || "temp_id", parseInt(expirationHours, 10) || 24);
    setNewKeyValue(generatedKey);
  };

  const handleCopyKey = (keyId: string) => {
    try {
      const storedKey = localStorage.getItem(`cipher_key_${keyId}`);
      if (storedKey) {
        const keyData = JSON.parse(storedKey);
        navigator.clipboard.writeText(keyData.key)
          .then(() => {
            toast.success(text.keyCopied);
          })
          .catch((error) => {
            console.error('Copy error:', error);
            toast.error(isArabic ? "فشل نسخ المفتاح" : "Failed to copy key");
          });
      }
    } catch (error) {
      console.error('Error accessing key:', error);
      toast.error(isArabic ? "فشل الوصول إلى المفتاح" : "Failed to access key");
    }
  };

  const isKeyExpired = (expiration: Date) => {
    return new Date() > new Date(expiration);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${isArabic ? "rtl font-arabic" : ""}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {text.title}
          </CardTitle>
          <CardDescription>{text.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {text.noKeys}
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 rounded-md bg-secondary border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{key.id}</span>
                      {isKeyExpired(key.expiration) && (
                        <Badge variant="destructive" className="text-xs">
                          {text.expired}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {text.expiresOn}: {new Date(key.expiration).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyKey(key.id)}
                      title={text.copyKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKey(key.id)}
                      title={text.deleteKey}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {text.addKey}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{text.addKey}</DialogTitle>
                <DialogDescription>
                  {isArabic
                    ? "قم بإنشاء مفتاح جديد للتشفير. يمكنك إدخال قيمة مفتاح أو توليد واحدة."
                    : "Create a new encryption key. You can enter a key value or generate one."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyId">{text.keyId}</Label>
                  <Input
                    id="keyId"
                    placeholder={text.keyIdPlaceholder}
                    value={newKeyId}
                    onChange={(e) => setNewKeyId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keyValue">{text.keyValue}</Label>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Input
                      id="keyValue"
                      placeholder={text.keyValuePlaceholder}
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={handleGenerateKey}>
                      <KeyRound className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {text.generate}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiration">{text.expiration}</Label>
                  <Input
                    id="expiration"
                    type="number"
                    value={expirationHours}
                    onChange={(e) => setExpirationHours(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {text.cancel}
                </Button>
                <Button onClick={handleAddKey}>
                  <Check className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  {text.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default KeyManager;
