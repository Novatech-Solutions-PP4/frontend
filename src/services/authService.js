// Simple mock auth service (kept for future backend integration)
export async function loginApi({ dni, password }){
  // In real app, call backend. Here we simulate network delay.
  await new Promise(r => setTimeout(r, 400))
  return { token: 'fake-token', name: 'Demo User' }
}
