import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para verificar se o usuário é admin
export const isAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Erro ao verificar role do usuário:', error)
      return false
    }
    
    return data?.role === 'admin'
  } catch (error) {
    console.error('Erro ao verificar role do usuário:', error)
    return false
  }
}

// Função para obter o perfil do usuário
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return null
  }
}

