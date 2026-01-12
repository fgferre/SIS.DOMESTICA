import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, UserPlus, Loader2, Trash2, Link, Share2 } from 'lucide-react';
import { EmployerService } from '@/services/EmployerService';

interface InviteModalProps {
  isOpen: boolean;
  employerId: string;
  employerName: string;
  onClose: () => void;
}

interface Invite {
  id: string;
  email: string;
  token: string;
  created_at: string;
}

export function InviteModal({ isOpen, employerId, employerName, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen, employerId]);

  const loadInvites = async () => {
    setLoadingInvites(true);
    try {
      const data = await EmployerService.getInvitesForEmployer(employerId);
      setInvites(data);
    } catch (err) {
      console.error('Failed to load invites:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Digite um email válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createPromise = EmployerService.createInvite(employerId, email.trim());
      await createPromise;
      setEmail('');
      await loadInvites();
    } catch (err: any) {
      if (err.message && err.message.includes('Já existe um convite')) {
        // Se já existe, apenas recarrega para mostrar na lista
        setError('Já existe um convite para este email. Veja abaixo.');
        await loadInvites();
      } else {
        setError(err.message || 'Erro ao criar convite.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (!confirm('Deseja cancelar este convite? O link deixará de funcionar.')) return;

    try {
      await EmployerService.cancelInvite(inviteId);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      alert('Erro ao cancelar convite.');
    }
  };

  const handleShareWhatsApp = (token: string) => {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
    const link = `${baseUrl}?invite=${token}`;
    const message = `Olá! Estou te convidando para gerenciar a Família *${employerName}* no SIS.DOMÉSTICA.\n\nAcesse o link para aceitar:\n${link}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = async (token: string, inviteId: string) => {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
    const link = `${baseUrl}?invite=${token}`;

    const message = `Olá! Estou te convidando para gerenciar a Família *${employerName}* no SIS.DOMÉSTICA.\n\nAcesse o link para aceitar:\n${link}`;

    await navigator.clipboard.writeText(message);
    setCopiedId(inviteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setCopiedId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-slate-800 rounded-xl border border-white/10 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] flex flex-col"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-6 flex-shrink-0">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Gerenciar Convites</h3>
              <p className="text-sm text-slate-400">{employerName}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6 flex-shrink-0">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Novo Convite</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1 bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  onKeyDown={e => e.key === 'Enter' && handleCreateInvite()}
                />
                <button
                  onClick={handleCreateInvite}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                O email serve apenas para identificar o convite.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px]">
            <label className="block text-sm font-medium text-slate-300 mb-2 sticky top-0 bg-slate-800 py-2 z-10 border-b border-white/5">
              Convites Pendentes ({invites.length})
            </label>

            {loadingInvites ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Nenhum convite pendente.</div>
            ) : (
              <div className="space-y-2 pb-2">
                {invites.map(invite => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                  >
                    <div className="truncate mr-3">
                      <p className="text-white text-sm font-medium truncate">{invite.email}</p>
                      <p className="text-xs text-slate-500">
                        Criado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleShareWhatsApp(invite.token)}
                        className="p-2 rounded-lg hover:bg-[#25D366]/20 text-slate-400 hover:text-[#25D366] transition-colors"
                        title="Enviar no WhatsApp"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(invite.token, invite.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedId === invite.id
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'hover:bg-slate-600 text-slate-400 hover:text-white'
                        }`}
                        title="Copiar Link"
                      >
                        {copiedId === invite.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Link className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Cancelar Convite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper icon component since Plus wasn't imported
function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
