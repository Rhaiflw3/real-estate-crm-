const DEV_USER_ID = '8532c1eb-346c-4b69-9986-c79523913ac9';

export async function getUserId(): Promise<string | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch {
    // fall through
  }

  try {
    const { supabase: mockClient } = await import('@/lib/supabase');
    const { data: { user } } = await mockClient.auth.getUser();
    if (user?.id) return user.id;
  } catch {
    // fall through
  }

  return DEV_USER_ID;
}
