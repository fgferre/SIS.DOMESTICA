import { supabase } from '@/lib/supabase';

export interface Employer {
  id: string;
  name: string;
  owner_id: string;
  role?: string; // Role of the current user in this employer
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  employer_id: string;
  payroll_data?: any;
}

export const EmployerService = {
  // 1. Listar Famílias que eu tenho acesso
  async getMyEmployers(): Promise<Employer[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Busca onde sou dono
    const { data: owned, error: ownedError } = await supabase
      .from('employers')
      .select('*')
      .eq('owner_id', user.id);

    if (ownedError) throw ownedError;

    // Busca onde sou membro (futuro)
    const { data: memberOf, error: memberError } = await supabase
      .from('employer_members')
      .select('employer_id, employers(*)')
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    // Merge results
    const employers = [...(owned || [])];
    memberOf?.forEach((m: any) => {
      if (!employers.find(e => e.id === m.employers.id)) {
        employers.push(m.employers);
      }
    });

    return employers;
  },

  // 2. Criar nova Família
  async createEmployer(name: string): Promise<Employer> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('employers')
      .insert({
        name,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 3. Listar Funcionários de uma Família
  async getEmployees(employerId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, role, employer_id, payroll_data') // Pegamos payroll_data pra saber se existe, mas não precisamos carregar tudo na lista se for pesado
      .eq('employer_id', employerId);

    if (error) throw error;
    return data || [];
  },

  // 4. Criar Funcionario
  async createEmployee(employerId: string, name: string, role: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        employer_id: employerId,
        name,
        role,
        payroll_data: {}, // Começa vazio
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 5. Salvar Dados do Funcionário (O Save Game)
  async saveEmployeeData(employeeId: string, payrollData: any) {
    const { error } = await supabase
      .from('employees')
      .update({
        payroll_data: payrollData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId);

    if (error) throw error;
  },

  // 6. Carregar Dados do Funcionário
  async loadEmployeeData(employeeId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('payroll_data')
      .eq('id', employeeId)
      .single();

    if (error) throw error;
    return data?.payroll_data;
  },

  // 7. Deletar Funcionário
  async deleteEmployee(employeeId: string) {
    const { error } = await supabase.from('employees').delete().eq('id', employeeId);

    if (error) throw error;
  },

  // 8. Deletar Família (só se não tiver funcionários)
  async deleteEmployer(employerId: string) {
    // Primeiro verifica se tem funcionários
    const { data: employees, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('employer_id', employerId);

    if (checkError) throw checkError;

    if (employees && employees.length > 0) {
      throw new Error(
        'Não é possível deletar uma família com funcionários. Delete os funcionários primeiro.'
      );
    }

    // Se não tem funcionários, pode deletar
    const { error } = await supabase.from('employers').delete().eq('id', employerId);

    if (error) throw error;
  },
};
