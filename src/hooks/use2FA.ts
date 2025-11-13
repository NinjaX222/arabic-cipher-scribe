import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as OTPAuth from 'otpauth';

interface TwoFactorAuth {
  id: string;
  secret: string;
  is_enabled: boolean;
  backup_codes: string[];
}

export const use2FA = () => {
  const [twoFactorAuth, setTwoFactorAuth] = useState<TwoFactorAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch2FA();
  }, []);

  const fetch2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching 2FA:', error);
      } else {
        setTwoFactorAuth(data);
      }
    } catch (error) {
      console.error('Error in fetch2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate a random secret
      const secret = new OTPAuth.Secret({ size: 20 });
      const secretBase32 = secret.base32;

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Save to database
      const { data, error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: user.id,
          secret: secretBase32,
          is_enabled: false,
          backup_codes: backupCodes
        })
        .select()
        .single();

      if (error) throw error;

      setTwoFactorAuth(data);
      
      // Create TOTP URI for QR code
      const totp = new OTPAuth.TOTP({
        issuer: 'SecureVault',
        label: user.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secretBase32)
      });

      return {
        secret: secretBase32,
        qrCodeUri: totp.toString(),
        backupCodes
      };
    } catch (error) {
      console.error('Error generating secret:', error);
      throw error;
    }
  };

  const enable2FA = async (verificationCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !twoFactorAuth) {
        throw new Error('User not authenticated or 2FA not set up');
      }

      // Verify the code
      const totp = new OTPAuth.TOTP({
        issuer: 'SecureVault',
        label: user.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(twoFactorAuth.secret)
      });

      const isValid = totp.validate({ token: verificationCode, window: 1 }) !== null;

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Enable 2FA
      const { error } = await supabase
        .from('two_factor_auth')
        .update({ is_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetch2FA();
      return true;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  };

  const disable2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('two_factor_auth')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setTwoFactorAuth(null);
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  };

  const verify2FACode = async (code: string): Promise<boolean> => {
    try {
      if (!twoFactorAuth) {
        throw new Error('2FA not set up');
      }

      // Check if it's a backup code
      if (twoFactorAuth.backup_codes.includes(code.toUpperCase())) {
        // Remove used backup code
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const updatedCodes = twoFactorAuth.backup_codes.filter(c => c !== code.toUpperCase());
        await supabase
          .from('two_factor_auth')
          .update({ backup_codes: updatedCodes })
          .eq('user_id', user.id);

        return true;
      }

      // Verify TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'SecureVault',
        label: 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(twoFactorAuth.secret)
      });

      const isValid = totp.validate({ token: code, window: 1 }) !== null;
      return isValid;
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
  };

  return {
    twoFactorAuth,
    loading,
    generateSecret,
    enable2FA,
    disable2FA,
    verify2FACode,
    fetch2FA
  };
};
