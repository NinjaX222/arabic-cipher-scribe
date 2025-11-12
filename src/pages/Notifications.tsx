import { useCipher } from '@/contexts/CipherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { isArabic } = useCipher();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const text = isArabic ? {
    title: 'الإشعارات',
    description: 'تتبع جميع أنشطة المشاركة والتشفير',
    markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد إشعارات',
    noNotificationsDesc: 'ستظهر الإشعارات هنا عند حدوث أنشطة جديدة',
    unread: 'غير مقروء',
    delete: 'حذف',
    markRead: 'تحديد كمقروء',
    viewShare: 'عرض المشاركة',
  } : {
    title: 'Notifications',
    description: 'Track all your sharing and encryption activities',
    markAllRead: 'Mark All as Read',
    noNotifications: 'No Notifications',
    noNotificationsDesc: 'Notifications will appear here when new activities occur',
    unread: 'Unread',
    delete: 'Delete',
    markRead: 'Mark as Read',
    viewShare: 'View Share',
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: isArabic ? ar : undefined,
    });
  };

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${isArabic ? 'rtl font-arabic' : ''}`}>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-6 ${isArabic ? 'rtl font-arabic' : ''}`}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6" />
                {text.title}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{text.description}</CardDescription>
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                {text.markAllRead}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{text.noNotifications}</h3>
              <p className="text-muted-foreground">{text.noNotificationsDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all ${
                    !notification.is_read
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                {text.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {text.markRead}
                            </Button>
                          )}
                          {notification.related_share_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate('/secure-share')}
                              className="h-8"
                            >
                              {text.viewShare}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            {text.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
