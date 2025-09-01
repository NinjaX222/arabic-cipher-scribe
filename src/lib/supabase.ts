// Demo authentication functions using localStorage
export const authService = {
  async signIn(email: string, password: string) {
    // Simulate API call
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find((u: any) => u.email === email && u.password === password)
        
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify({ email: user.email, name: user.name }))
          resolve({ success: true, message: 'Login successful' })
        } else {
          resolve({ success: false, message: 'Invalid email or password' })
        }
      }, 1000)
    })
  },

  async signUp(name: string, email: string, password: string) {
    // Simulate API call
    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const existingUser = users.find((u: any) => u.email === email)
        
        if (existingUser) {
          resolve({ success: false, message: 'User already exists' })
        } else {
          const newUser = { name, email, password, id: Date.now() }
          users.push(newUser)
          localStorage.setItem('users', JSON.stringify(users))
          resolve({ success: true, message: 'Registration successful' })
        }
      }, 1000)
    })
  },

  async signOut() {
    localStorage.removeItem('currentUser')
    return { success: true, message: 'Logged out successfully' }
  },

  getCurrentUser() {
    const user = localStorage.getItem('currentUser')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('currentUser')
  }
}