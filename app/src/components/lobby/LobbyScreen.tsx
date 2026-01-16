import React, { useEffect, useState } from 'react';
import { Employer, Employee, EmployerService } from '@/services/EmployerService';
import { Loader2, Plus, Users, Layout, User, Trash2, LogOut, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { InviteModal } from '@/components/invite/InviteModal';
import { SystemBackground } from '@/components/ui/SystemBackground';

interface LobbyScreenProps {
  onSelectEmployee: (employee: Employee) => void;
  onLogout: () => void;
}

export function LobbyScreen({ onSelectEmployee, onLogout }: LobbyScreenProps) {
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isCreatingEmployer, setIsCreatingEmployer] = useState(false);
  const [newEmployerName, setNewEmployerName] = useState('');

  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('Doméstica');

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'employee' | 'employer' | 'warning';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, type: 'employee', title: '', message: '', onConfirm: () => {} });

  // Invite modal state
  const [inviteModal, setInviteModal] = useState<{ isOpen: boolean; employer: Employer | null }>({
    isOpen: false,
    employer: null,
  });

  useEffect(() => {
    loadEmployers();
  }, []);

  useEffect(() => {
    if (selectedEmployer) {
      loadEmployees(selectedEmployer.id);
    }
  }, [selectedEmployer]);

  const loadEmployers = async () => {
    try {
      setLoading(true);
      const data = await EmployerService.getMyEmployers();
      setEmployers(data);
      // Auto-select if only one
      if (data.length === 1) setSelectedEmployer(data[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (employerId: string) => {
    try {
      setLoading(true);
      const data = await EmployerService.getEmployees(employerId);
      setEmployees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployerName.trim()) return;
    try {
      setLoading(true);
      const newEmp = await EmployerService.createEmployer(newEmployerName);
      setEmployers([...employers, newEmp]);
      setSelectedEmployer(newEmp);
      setIsCreatingEmployer(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar família');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployer || !newEmployeeName.trim()) return;
    try {
      setLoading(true);
      const newEmp = await EmployerService.createEmployee(
        selectedEmployer.id,
        newEmployeeName,
        newEmployeeRole
      );
      setEmployees([...employees, newEmp]);
      setIsCreatingEmployee(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEmployee = (employeeId: string, employeeName: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'employee',
      title: 'Deletar Funcionário',
      message: `Tem certeza que deseja deletar "${employeeName}"? Esta ação não pode ser desfeita e todos os dados de folha serão perdidos.`,
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
        try {
          setLoading(true);
          await EmployerService.deleteEmployee(employeeId);
          setEmployees(employees.filter(e => e.id !== employeeId));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const confirmDeleteEmployer = async (employer: Employer) => {
    // First check if has employees
    try {
      const emps = await EmployerService.getEmployees(employer.id);
      if (emps.length > 0) {
        // Show warning: cannot delete
        setDeleteModal({
          isOpen: true,
          type: 'warning',
          title: 'Não é possível deletar',
          message: `A família "${employer.name}" possui ${emps.length} funcionário(s) cadastrado(s). Delete os funcionários primeiro para poder deletar a família.`,
          onConfirm: () => setDeleteModal(prev => ({ ...prev, isOpen: false })),
        });
        return;
      }
    } catch (error) {
      console.error(error);
      return;
    }

    // No employees, show confirmation
    setDeleteModal({
      isOpen: true,
      type: 'employer',
      title: 'Deletar Família',
      message: `Tem certeza que deseja deletar a família "${employer.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
        try {
          setLoading(true);
          await EmployerService.deleteEmployer(employer.id);
          setEmployers(employers.filter(e => e.id !== employer.id));
          if (selectedEmployer?.id === employer.id) {
            setSelectedEmployer(null);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (loading && employers.length === 0) {
    return (
      <div className="relative flex items-center justify-center min-h-screen text-white">
        <SystemBackground mode="form" />
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 relative z-10" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white p-8">
      <SystemBackground mode="form" />
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 text-center relative">
          <button
            onClick={onLogout}
            className="absolute right-0 top-0 text-sm text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Sis.Doméstica
          </h1>
          <p className="text-slate-400 mt-2">Escolha onde você quer trabalhar hoje</p>
        </header>

        {!selectedEmployer ? (
          // STEP 1: SELECT EMPLOYER
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Layout className="h-5 w-5 text-indigo-400" />
                Suas Famílias
              </h2>
              <button
                onClick={() => setIsCreatingEmployer(true)}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Plus className="h-4 w-4" /> Nova Família
              </button>
            </div>

            {isCreatingEmployer && (
              <form
                onSubmit={handleCreateEmployer}
                className="bg-slate-800 p-4 rounded-xl border border-white/5 flex gap-2 relative z-50"
              >
                <input
                  type="text"
                  placeholder="Ex: Família Ferreira"
                  value={newEmployerName}
                  onChange={e => setNewEmployerName(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-500 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingEmployer(false)}
                  className="text-slate-400 px-3 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                >
                  Cancelar
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
              {employers.length === 0 && !isCreatingEmployer && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-800/50 rounded-xl border border-white/5 border-dashed">
                  Nenhuma família encontrada. Crie a primeira!
                </div>
              )}

              {employers.map(emp => (
                <motion.div
                  key={emp.id}
                  whileHover={{ scale: 1.02 }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEmployer(emp);
                    }
                  }}
                  className="relative w-full max-w-sm p-6 pb-12 bg-slate-800 hover:bg-slate-700/80 border border-white/5 rounded-xl text-left hover:border-indigo-500/50 transition-all group shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  onClick={() => setSelectedEmployer(emp)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-indigo-500/10 p-3 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                      <Users className="h-6 w-6 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">{emp.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">Clique para entrar</p>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setInviteModal({ isOpen: true, employer: emp });
                    }}
                    className="absolute bottom-3 left-3 p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    title="Convidar membro"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      confirmDeleteEmployer(emp);
                    }}
                    className="absolute bottom-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    title="Deletar família"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // STEP 2: SELECT EMPLOYEE
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedEmployer(null)}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
              >
                ← Voltar para Famílias
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedEmployer.name}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <Layout className="h-4 w-4" /> Gerenciando Funcionários
                </p>
              </div>

              <button
                onClick={() => setIsCreatingEmployee(true)}
                className="text-sm bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg shadow-emerald-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Plus className="h-4 w-4" /> Adicionar Funcionário
              </button>
            </div>

            {isCreatingEmployee && (
              <form
                onSubmit={handleCreateEmployee}
                className="bg-slate-800 p-6 rounded-xl border border-white/5 space-y-4"
              >
                <h3 className="text-lg font-medium">Novo Contrato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-slate-500 font-bold">Nome</label>
                    <input
                      autoFocus
                      placeholder="Ex: Maria da Silva"
                      value={newEmployeeName}
                      onChange={e => setNewEmployeeName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-slate-500 font-bold">Cargo</label>
                    <select
                      value={newEmployeeRole}
                      onChange={e => setNewEmployeeRole(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                    >
                      <option>Doméstica</option>
                      <option>Babá</option>
                      <option>Motorista</option>
                      <option>Cuidador(a)</option>
                      <option>Outro</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingEmployee(false)}
                    className="text-slate-400 px-4 py-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
              {employees.length === 0 && !isCreatingEmployee && (
                <div className="col-span-full py-16 text-center">
                  <div className="bg-slate-800/50 inline-block p-4 rounded-full mb-4">
                    <User className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">Nenhum funcionário aqui</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Cadastre o primeiro funcionário para começar os cálculos da folha de pagamento.
                  </p>
                </div>
              )}

              {employees.map(emp => (
                <motion.div
                  key={emp.id}
                  whileHover={{ y: -4 }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectEmployee(emp);
                    }
                  }}
                  className="relative w-full max-w-sm group overflow-hidden bg-slate-800 hover:bg-slate-700/80 border border-white/5 rounded-xl text-left transition-all hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  onClick={() => onSelectEmployee(emp)}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors" />
                  <div className="p-6 pl-8 pb-12">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-200 transition-colors">
                          {emp.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {emp.role}
                        </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <User className="h-5 w-5 text-indigo-400" />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                      <span>Clique para gerenciar</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      confirmDeleteEmployee(emp.id, emp.name);
                    }}
                    className="absolute bottom-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 z-10"
                    title="Deletar funcionário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        variant={deleteModal.type === 'warning' ? 'warning' : 'danger'}
        confirmText={deleteModal.type === 'warning' ? 'Entendi' : 'Deletar'}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Invite Modal */}
      {inviteModal.employer && (
        <InviteModal
          isOpen={inviteModal.isOpen}
          employerId={inviteModal.employer.id}
          employerName={inviteModal.employer.name}
          onClose={() => setInviteModal({ isOpen: false, employer: null })}
        />
      )}
    </div>
  );
}
