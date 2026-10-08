import { supabaseUrl, supabaseAnonKey } from './supabase';

export async function verifyInviteCode(inviteCode: string): Promise<boolean> {
  const code = inviteCode.trim();
  if (!code) return false;
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/verify-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
      body: JSON.stringify({ inviteCode: code }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { valid?: boolean };
    return data?.valid === true;
  } catch {
    return false;
  }
}
